import {Bloom, EffectComposer} from "@react-three/postprocessing";
import {folder, useControls} from "leva";
import {EffekseerRender} from "../../EffekseerRenderPass";


export default function EffectsComponent() {
  const {enable, /*luminanceThreshold, intensity*/} = useControls('PostProcessing', {
    enable: {
      value: false
    },
    /*bloom: folder({
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
    })*/
  }, {collapsed: true})


  return (
    (enable)
      ?
      <EffectComposer depthBuffer stencilBuffer={true} disableNormalPass multisampling={0}>


        {// @ts-ignore: Compiler doesn't like the mipmapBlur prop right now
          /*<Bloom mipmapBlur luminanceThreshold={luminanceThreshold} intensity={intensity}/>*/
        }

        {<EffekseerRender/>}


      </EffectComposer>

      : null
  )
}