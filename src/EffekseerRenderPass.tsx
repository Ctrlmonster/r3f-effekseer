import {Pass} from 'postprocessing'
import {Camera, Scene, WebGLRenderer, WebGLRenderTarget} from "three";
import {EffekseerContext, EffekseerReactContext} from "./r3f-effekseer";
import {ForwardedRef, forwardRef, useContext, useMemo} from "react";
import {useThree} from "@react-three/fiber";

export class EffekseerRenderPass extends Pass {
  context: EffekseerContext;

  constructor(scene: Scene, camera: Camera, context: EffekseerContext) {
    super()
    this.scene = scene;
    this.camera = camera;
    this.context = context;
  }

  render(renderer: WebGLRenderer, inputBuffer: WebGLRenderTarget | null, outputBuffer: WebGLRenderTarget | null) {
    renderer.setRenderTarget(outputBuffer);
    renderer.resetState();

    this.context.setProjectionMatrix(this.camera.projectionMatrix.elements as unknown as Float32Array);
    this.context.setCameraMatrix(this.camera.matrixWorldInverse.elements as unknown as Float32Array);
    this.context.draw();
  }
}

type EffekseerRenderProps = {};
export const EffekseerRender = forwardRef(function (props: EffekseerRenderProps, ref: ForwardedRef<EffekseerRenderPass>) {
  const {camera, scene} = useThree();
  const {manager} = useContext(EffekseerReactContext);
  const pass = useMemo(() => new EffekseerRenderPass(scene, camera, manager.context!), []);

  return <primitive ref={ref} object={pass}/>
});