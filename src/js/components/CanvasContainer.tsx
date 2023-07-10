import React, {useState} from "react";
import {Canvas} from "@react-three/fiber";
import {PerformanceMonitor} from "@react-three/drei";
import {useControls} from "leva";
import {Perf} from "r3f-perf";
import {SceneContainer} from "./SceneContainer";
import {useRenderOnDemand} from "../helper/hooks/useRenderOnDemand";
import {EffectButtons} from "../gui/EffectButtons";


// ------------------------------------------------------------------
// Initial dpr values for performance monitoring
const START_DPR = 1;
const MAX_DPR = 2;
const MIN_DPR = 0.5;
const updateDpr = (factor: number) => {
  return Math.round((MIN_DPR + factor * (MAX_DPR - MIN_DPR)) * 100) / 100;
}

// ------------------------------------------------------------------


export function CanvasContainer() {
  const renderOnDemand = useRenderOnDemand(false);
  // ------------------------------------------------------------------
  // dpr and app controls
  const [dpr, setDpr] = useState(START_DPR);
  const {enableDynamicDpr, showPerf} = useControls({
    showPerf: false,
    enableDynamicDpr: false,
  });
  // -------------------------------------------------------------------
  const [effects, setEffects] = useState<string[]>([]);
  // -------------------------------------------------------------------

  return (
    <>
      <Canvas dpr={dpr}
              frameloop={(renderOnDemand) ? "demand" : "always"}
              shadows={true}
              gl={{
                premultipliedAlpha: true
              }}
      >

        <PerformanceMonitor onChange={({factor}) => enableDynamicDpr && setDpr(updateDpr(factor))}>
          <SceneContainer setEffects={setEffects}/>
        </PerformanceMonitor>


        {showPerf && <Perf position="bottom-left"/>}
      </Canvas>

      <EffectButtons effects={effects}/>
    </>
  )
}