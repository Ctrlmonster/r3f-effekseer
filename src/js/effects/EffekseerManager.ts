import wasmUrl from "../effects/effekseer/effekseer.wasm?url";
import {Camera, Clock, Scene, WebGLRenderer} from "three";
import {EffekseerContext, EffekseerEffect} from "src/js/effects/effekseer/effekseer";


type EffectInitializationPackage = {
  name: string, url: string, scale: number,
  onload: (() => void) | undefined,
  onerror: ((reason: string, path: string) => void) | undefined,
  redirect: ((path: string) => string) | undefined,
  resolve: (value: EffekseerEffect | PromiseLike<EffekseerEffect>) => void;
  reject: (reason?: any) => void;
}


export class EffekseerManager {
  effects: Record<string, EffekseerEffect> = {};
  context: EffekseerContext = null!;
  camera: Camera = null!;
  clock: Clock = null!;
  gl: WebGLRenderer = null!;
  scene: Scene = null!;

  // fast rendering by skipping state fetching.
  // If there is a problem with the drawing, please set this flag to false.
  fastRenderMode = true;
  initialized = false;

  effectInitializationQueue = new Set<EffectInitializationPackage>();
  loadingEffectByName = new Map<string, {
    success: () => void;
    failure: (m: string, url: string) => void;
  }[]>();

  // -------------------------------------------------------------------------

  async loadEffect(name: string, url: string, scale: number,
                   onload: (() => void) | undefined,
                   onerror: ((reason: string, path: string) => void) | undefined,
                   redirect: ((path: string) => string) | undefined): Promise<EffekseerEffect> {


    if (this.initialized) {
      return new Promise<EffekseerEffect>((resolve, reject) => {
        this.#addEffect({
          name,
          url,
          scale,
          onload,
          onerror,
          redirect,
          resolve,
          reject
        });
      });
    }
    // if the manager isn't done initializing
    else {
      // The effect will be loaded as soon as the manager is done initializing.
      // The promise will be resolved when the effect is loaded.
      return new Promise<EffekseerEffect>((resolve, reject) => {
        this.effectInitializationQueue.add({
          name,
          url,
          scale,
          onload,
          onerror,
          redirect,
          resolve, reject
        });
      });
    }
  }

  #addEffect(args: EffectInitializationPackage) {
    const {name, url, scale, onload, onerror, redirect, resolve, reject} = args;
    if (this.effects[name]) {
      console.log(`effect ${name} is already loaded`);
      resolve(this.effects[name]);

      const callbacks = this.loadingEffectByName.get(name);
      if (callbacks) {
        for (const promise of callbacks) {
          promise.success();
        }
      }
      this.loadingEffectByName.delete(name);
      return;
    }


    // We don't want to start loading the same effect multiple times,
    // that's why we check if it's already loading and in that case
    // just pass the success / failure callbacks to the loading callback

    if (this.loadingEffectByName.has(name)) {
      console.log(`effect ${name} is already loading`);

      this.loadingEffectByName.get(name)!.push({
        success: () => {
          onload?.();
          resolve(this.effects[name]);
        },
        failure: (m: string, url: string) => {
          onerror?.(m, url);
          reject();
        }
      });
    }

    // start a new loading process
    else {
      console.log(`start loading effect ${name}`);
      this.loadingEffectByName.set(name, []);


      const effect = this.context.loadEffect(
        url,
        scale,
        // Packaging promise resolve and reject with user callbacks,
        // this way we can resolve the promise when the effect is loaded.
        () => {
          this.effects[name] = effect;
          onload?.();
          // get all other promises that are waiting for this effect to load and resolve them
          const callbacks = this.loadingEffectByName.get(name);
          if (callbacks) {
            for (const promise of callbacks) {
              promise.success();
            }
          }
          this.loadingEffectByName.delete(name);
          resolve(this.effects[name]);
        },
        (m, url) => {
          onerror?.(m, url);
          const promises = this.loadingEffectByName.get(name);
          if (promises) {
            for (const promise of promises) {
              promise.failure(m, url);
            }
          }
          reject();
        },
        redirect
      );
    }


  }


  init(gl: WebGLRenderer, scene: Scene, camera: Camera, clock: Clock, setEffects: (effects: Record<string, EffekseerEffect>, context: EffekseerContext) => void) {
    // init your imperative code here
    this.camera = camera;
    this.clock = clock;
    this.gl = gl;
    this.scene = scene;


    effekseer.initRuntime(wasmUrl, () => {
      this.context = effekseer.createContext(

      );
      this.context.init(gl.getContext());

      if (this.fastRenderMode) {
        this.context.setRestorationOfStatesFlag(false);
      }

      for (const effectInitPackage of this.effectInitializationQueue) {
        this.#addEffect(effectInitPackage);
        this.effectInitializationQueue.delete(effectInitPackage);
      }

      setEffects(this.effects, this.context);

      this.initialized = true;
    }, () => {
      console.log("Failed to initialize effekseer");
    });

  }

  destroy() {
    // destroy your imperative code here
  }

  update(delta: number) {
    if (this.context) {
      // Put all of your imperative .update() calls here
      this.context.update(delta * 60.0); // Also check if time is passed correctly here
      //this.context.update(this.clock.getDelta() * 60.0);

      this.gl.render(this.scene, this.camera);
      // this is supposed to happen after renderer.render - so we have to check this
      // also check whether the types are correct at run-time here
      this.context.setProjectionMatrix(this.camera.projectionMatrix.elements as unknown as Float32Array);
      this.context.setCameraMatrix(this.camera.matrixWorldInverse.elements as unknown as Float32Array);
      this.context.draw();

      // Effekseer makes states dirty. So reset three.js states
      if (this.fastRenderMode) {
        this.gl.resetState();
      }
    }
  }


  disposeEffect(name: string) {
    if (this.effects[name]) {
      this.context.releaseEffect(this.effects[name]);
      delete this.effects[name];
    } else {
      console.warn(`Effect ${name} not found`);
    }
  }

  playEffect(name: string) {
    return this.context.play(this.effects[name], 0, 0, 0);
  }

}


export type EffectPlayOptions = {
  position?: [number, number, number],
  targetPosition?: [number, number, number],
  rotation?: [number, number, number],
  scale?: [number, number, number],
  speed?: number,
  startFrame?: number,
  endFrame?: number,
  shown?: boolean,
  // to be extended
}