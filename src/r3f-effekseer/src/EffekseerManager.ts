import wasmPath from "../vendor/effekseer.wasm?url";
import {Camera, Clock, Scene, WebGLRenderer} from "three";
import {EffectInstance, effekseer} from "../";
import {EffekseerContext, EffekseerEffect} from "src/r3f-effekseer/vendor/effekseer-native";

export type EffectLoadingPackage = {
  name: string, path: string, scale: number,
  onload: (() => void) | undefined,
  onerror: ((reason: string, path: string) => void) | undefined,
  redirect: ((path: string) => string) | undefined,
  resolve: (value: EffekseerEffect | PromiseLike<EffekseerEffect>) => void;
  reject: (reason?: any) => void;
}


export type EffekseerSettings = {
  instanceMaxCount?: number
  squareMaxCount?: number,
  enableExtensionsByDefault?: boolean,
  enablePremultipliedAlpha?: boolean,
  enableTimerQuery?: boolean,
  onTimerQueryReport?: (averageDrawTime: number) => void,
  timerQueryReportIntervalCount?: number,
}


export class EffekseerManager {
  effects: Record<string, EffekseerEffect> = {};
  context: EffekseerContext | null = null;
  camera: Camera | null = null;
  clock: Clock | null = null;
  gl: WebGLRenderer | null = null;
  scene: Scene | null = null;
  settings: EffekseerSettings | null = null;

  // fast rendering by skipping state fetching.
  // If there is a problem with the drawing, please set this flag to false.
  fastRenderMode = true; // TODO: needs to be exposed to RC
  initialized = false;

  effectLoadingQueue = new Set<EffectLoadingPackage>();
  loadingCallbacksByName = new Map<string, {
    success: () => void;
    failure: (m: string, path: string) => void;
  }[]>();


  #setEffects: ((effects: Record<string, EffekseerEffect>) => void) | null = null;
  #isPreloadingRuntime: boolean = false;

  // -------------------------------------------------------------------------------------------------------------------
  _effectInstances: Record<string, Set<EffectInstance>> = {};


  async loadEffect(name: string, path: string, scale: number,
                   onload: (() => void) | undefined,
                   onerror: ((reason: string, path: string) => void) | undefined,
                   redirect: ((path: string) => string) | undefined): Promise<EffekseerEffect> {

    // Check if the manager is initialized, if it isn't this effect will be automatically
    // loaded as soon the manager is ready.

    if (this.initialized) {
      return new Promise<EffekseerEffect>((resolve, reject) => {
        this.#addEffect({name, path, scale, onload, onerror, redirect, resolve, reject});
      });
    }
    // if the manager isn't done initializing
    else {
      // The effect will be loaded as soon as the manager is done initializing.
      // The promise will be resolved when the effect is loaded.
      return new Promise<EffekseerEffect>((resolve, reject) => {
        this.effectLoadingQueue.add({name, path, scale, onload, onerror, redirect, resolve, reject});
      });
    }
  }

  #addEffect(args: EffectLoadingPackage) {
    const {name, path, scale, onload, onerror, redirect, resolve, reject} = args;
    // early return if the effect is already loaded
    if (this.effects[name]) {
      resolve(this.effects[name]);
      return;
    } // _______________________________________________________________________

    // We don't want to start loading the same effect multiple times,
    // that's why we check if it's currently loading and in that case just
    // pass the success / failure callbacks to the callback that will be
    // executed when the previously started loading process finishes.
    if (this.loadingCallbacksByName.has(name)) {
      console.log(`effect ${name} is already loading`);
      this.loadingCallbacksByName.get(name)!.push({
        success: () => {
          onload?.();
          resolve(this.effects[name]);
        },
        failure: (m: string, path: string) => {
          onerror?.(m, path);
          reject();
        }
      });
    } // _______________________________________________________________________

    // Start a new loading process for this effect
    else {
      if (!this.context) throw new Error("loading effect while context isn't ready");

      this.loadingCallbacksByName.set(name, []);

      console.log(`start loading effect ${name}`);

      const effect = this.context!.loadEffect(
        path,
        scale,
        // Packaging promise resolve and reject with user callbacks,
        // this way we resolve the promise when the effect is loaded.
        () => {
          console.log("loading completed", name);
          console.log(performance.now());
          this.effects[name] = effect;
          onload?.();
          resolve(this.effects[name]);
          // get all other promises that are waiting for this effect to load and resolve them too
          const loadingCallbacks = this.loadingCallbacksByName.get(name);
          if (loadingCallbacks) {
            for (const callback of loadingCallbacks) {
              callback.success();
            }
          }
          this.loadingCallbacksByName.delete(name);
          this.#setEffects?.(this.effects);
        },
        // same if the loading process failed - reject all promises
        (m, path) => {
          onerror?.(m, path);
          reject();
          const loadingCallbacks = this.loadingCallbacksByName.get(name);
          if (loadingCallbacks) {
            for (const callback of loadingCallbacks) {
              callback.failure(m, path);
            }
          }
        },
        redirect
      );
    }
  }


  /**
   * Effects can not be loaded before the EffekseerContext is created
   * @param name
   * @param path
   * @param scale
   * @param onload
   * @param onerror
   */
  preloadEffect(name: string, path: string, scale?: number,
                onload?: (() => void) | undefined,
                onerror?: ((reason: string, path: string) => void) | undefined) {

    // this will trigger the runtime to preload, if it hasn't already
    this.preloadRuntime();

    // this will cause the effect to load as soon as the runtime is initialized
    this.loadEffect(
      name,
      path,
      scale ?? 1,
      onload,
      onerror,
      undefined,
    )
  }

  /**
   * Gets automatically called via preloadEffect
   */
  preloadRuntime() {
    if (this.context == null && !this.#isPreloadingRuntime) {
      this.#isPreloadingRuntime = true;

      console.log("Starting to preload wasm runtime now");

      console.log(effekseer);
      effekseer.initRuntime(wasmPath, () => {
        this.#isPreloadingRuntime = false;
        console.log("PRELOAD COMPLETE");
        // check if this.init() has been called since we started initializing
        if (this.gl && this.#setEffects) {
          this.#completeRuntimeInitialization();
        } else {
          console.log(this.gl);
          console.log(this.#setEffects);
          console.log("couldn't complete runtime");
        }
      }, () => {
        console.log("Failed to preload effekseer");
      })
    }
  }


  init(gl: WebGLRenderer, scene: Scene, camera: Camera, clock: Clock,
       settings: EffekseerSettings | null, setEffects: (effects: Record<string, EffekseerEffect>) => void) {
    // init your imperative code here
    this.camera = camera;
    this.clock = clock;
    this.gl = gl;
    this.scene = scene;
    this.settings = settings;
    this.#setEffects = (effects) => setEffects({...effects});

    console.log("INITIALIZING WASM RUNTIME... ");
    console.log("CURRENT STATUS:");

    // Check whether preloading the runtime is completed. In this case we only need to call complete
    if (this.context) {
      console.log("-> preloading already finished");
      this.#completeRuntimeInitialization();
      return;
    }
    // If it isn't, check if we preloaded at all. If we didn't start initialization now.
    // If we are preloading and are just not ready, complete will be called on completion
    if (!this.#isPreloadingRuntime) {
      console.log("-> no preloading found, initializing runtime now...");
      // init and callback can also get separated, so the runTime could also be preloaded
      effekseer.initRuntime(wasmPath, () => {
        this.#completeRuntimeInitialization();
      }, () => {
        console.log("Failed to initialize effekseer");
      });
    }
  }


  #completeRuntimeInitialization() {
    console.log("completing runtime init");
    this.context = effekseer.createContext();
    this.#isPreloadingRuntime = false;


    this.context!.init(this.gl!.getContext(), this.settings ?? undefined);

    if (this.fastRenderMode) {
      this.context!.setRestorationOfStatesFlag(false);
    }
    // load the effects that are already waiting
    for (const effectInitPackage of this.effectLoadingQueue) {
      this.#addEffect(effectInitPackage);
      this.effectLoadingQueue.delete(effectInitPackage);
    }
    // we need to update the React context states whenever a new effect
    // gets loaded, that's why save a reference to the setter here
    this.#setEffects!(this.effects);
    this.initialized = true;
  }


  destroy() {
    if (this.context) {
      // destroy all leftover effects
      for (const effect of Object.keys(this.effects)) {
        this.context.releaseEffect(effect);
      }
      // destroy the context
      effekseer.releaseContext(this.context);
      this.context = null!;
    }
    this.#setEffects = null!;
    this.initialized = false;
  }

  render(delta: number) {
    if (this.context) {
      this.context.update(delta * 60.0); // Also check if time is passed correctly here
      //this.context.update(this.clock.getDelta() * 60.0); <- this is from the three.js demo

      this.context.setProjectionMatrix(this.camera!.projectionMatrix.elements as unknown as Float32Array);
      this.context.setCameraMatrix(this.camera!.matrixWorldInverse.elements as unknown as Float32Array);
      this.context.draw();

      // Effekseer makes states dirty. So reset three.js states
      if (this.fastRenderMode) {
        this.gl!.resetState();
      }
    }
  }


  _registerEffectInstance(instance: EffectInstance) {
    const {name} = instance;
    if (this._effectInstances[name]) {
      this._effectInstances[name].add(instance);
    } else {
      this._effectInstances[name] = new Set([instance]);
    }
  }

  _removeEffectInstance(instance: EffectInstance) {
    const {name} = instance;
    const allInstances = this._effectInstances[name];
    allInstances.delete(instance);
    if (allInstances.size === 0) {
      delete this._effectInstances[name];
    }
  }

  /**
   *
   * @param name - name of the effect
   * @param force - if the force flag is specified,
   * the system won't check if any EffectInstances using that effect are left
   */
  disposeEffect(name: string, force = false) {
    if (this.effects && this.effects[name]) {
      // before we can remove the effect completely, we
      // have to check whether any other instances are
      // still using the effect.
      if (!this._effectInstances[name] || force) {
        this.context?.releaseEffect(this.effects[name]);
        delete this.effects[name];
        this.#setEffects?.(this.effects);
      }
    } else {
      console.warn(`Effect ${name} not found`);
    }
  }

  playEffect(name: string) {
    return this.context?.play(this.effects[name], 0, 0, 0);
  }
}

export const effekseerManager = new EffekseerManager();
