import {EffectComposer, Bloom} from "@react-three/postprocessing";
import {folder, useControls} from "leva";


// For reference, this is what the effekseer render pass looks like
// from: https://github.com/effekseer/EffekseerForWebGL/blob/master/tests/post_processing_threejs.html

/*
class EffekseerRenderPass extends THREE.Pass {
  constructor(scene, camera, context) {
    super();
    this.scene = scene;
    this.camera = camera;
    this.context = context;
    this.needsSwap = false;
  }

  render(renderer, writeBuffer, readBuffer) {
    renderer.setRenderTarget(this.renderToScreen ? null : readBuffer);
    this.context.setProjectionMatrix(this.camera.projectionMatrix.elements);
    this.context.setCameraMatrix(this.camera.matrixWorldInverse.elements);
    this.context.draw();
  }
}
*/


export default function EffectsComponent() {
  const {enable, luminanceThreshold, intensity} = useControls('PostProcessing', {
    enable: {
      value: false
    },
    bloom: folder({
      luminanceThreshold: {
        value: 0,
        min: 0,
        max: 2,
      },
      intensity: {
        value: 10,
        min: 0,
        max: 10,
      }
    })
  }, {collapsed: true})


  return (
    (enable)
      ?
      <EffectComposer depthBuffer stencilBuffer={false} disableNormalPass multisampling={0}>
        {// @ts-ignore: Compiler doesn't like the mipmapBlur prop right now
          <Bloom mipmapBlur luminanceThreshold={luminanceThreshold} intensity={intensity}/>}
      </EffectComposer>

      : null
  )
}