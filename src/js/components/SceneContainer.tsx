import PostProcessing from "./PostProcessing";
import {OrbitControls} from "@react-three/drei";
import {useFrame, useThree} from "@react-three/fiber";
import {SceneLights} from "./SceneLights";
import {ViewportHelper} from "../helper/ViewportHelper";
import {useEffect} from "react";
import {Camera, Clock, Scene, WebGLRenderer} from "three";

console.log(effekseer);

import wasmUrl from "../effects/effekseer.wasm?url";
import {EffekseerContext, EffekseerEffect} from "effekseer";


class Simulation {
  effects: Record<string, EffekseerEffect> = {};
  context: EffekseerContext = null!;
  camera: Camera = null!;
  clock: Clock = null!;
  gl: WebGLRenderer = null!;
  scene: Scene = null!;

  // fast rendering by skipping state fetching.
  // If there is a problem with the drawing, please set this flag to false.
  fastRenderMode = false;

  // -------------------------------------------------------------------------


  init(gl: WebGLRenderer, scene: Scene, camera: Camera, clock: Clock) {
    // init your imperative code here
    this.camera = camera;
    this.clock = clock;
    this.gl = gl;
    this.scene = scene;


    effekseer.initRuntime(wasmUrl, () => {
      this.context = effekseer.createContext();
      this.context.init(gl.getContext(), {
        enablePremultipliedAlpha: true,
      });
      this.effects["Laser01"] = this.context.loadEffect(
        "../Resources/Laser01.efk",
        1.0,
        () => {
          // called when loading is finished.
        },
        (m, url) => {
          // called when error causes.
          console.log(m + " " + url);
        }
      );


      if (this.fastRenderMode) {
        this.context.setRestorationOfStatesFlag(false);
      }

      this.effects["Laser02"] = this.context.loadEffect("../Resources/Laser02.efk");
      this.effects["Simple_Ring_Shape1"] = this.context.loadEffect("../Resources/Simple_Ring_Shape1.efk");
      this.effects["block"] = this.context.loadEffect("../Resources/block.efk");


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

  playEffect(name: string) {
    const handle = this.context.play(this.effects[name], 0, 0, 0);
    console.log(handle);
    handle.setLocation(0, 0, 0);
    handle.setRotation(0, 0, 0);
    handle.setScale(0.5, 0.5, 0.5);
    //handle.setLocation(document.getElementById("posx").value, document.getElementById("posy").value, document.getElementById("posz").value);
    //handle.setRotation(document.getElementById("rotx").value / 180.0 * 3.14, document.getElementById("roty").value / 180.0 * 3.14, document.getElementById("rotz").value / 180.0 * 3.14);
  }

}

const simulation = new Simulation();
console.log(simulation.effects);
// @ts-ignore
window.simulation = simulation


// ================================================================================================================
// ================================================================================================================
// ================================================================================================================


export function SceneContainer() {
  const state = useThree(({gl, scene, camera, clock}) => ({gl, scene, camera, clock}));

  useEffect(() => {
    // init the simulation - this is how you get access 
    // to scene, camera, renderer etc. from your imperative code.
    simulation.init(state.gl, state.scene, state.camera, state.clock);
    return () => simulation.destroy();
  }, []);

  useFrame((state, delta) => {
    // connecting the simulation to r3f's render loop, 
    // it will now get updated every frame
    simulation.update(delta);
  }, 1)


  return (
    <>
      {/* YOUR SCENE HERE  -------------------------------------------------*/
        <>
          <mesh position={[0, 0, -1]} scale={[0.5, 0.5, 0.5]} castShadow={true} receiveShadow={true}>
            <sphereGeometry/>
            <meshStandardMaterial color="orange"/>
          </mesh>

          <mesh position={[0.5, 1, 1]} castShadow={true} receiveShadow={true}>
            <boxGeometry/>
            <meshStandardMaterial color="hotpink"/>
          </mesh>
        </>
        /* YOUR SCENE HERE  -------------------------------------------------*/
      }


      <ViewportHelper showGizmo={true} showGrid={true}/>
      <OrbitControls/>
      <SceneLights/>
      <PostProcessing/>
    </>
  )
}
