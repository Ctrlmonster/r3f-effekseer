import PostProcessing from "./PostProcessing";
import {OrbitControls} from "@react-three/drei";
import {SceneLights} from "./SceneLights";
import {ViewportHelper} from "../helper/ViewportHelper";
import {useControls} from "leva";
import {Effect} from "../effects/Effect";
import React, {Suspense, useContext, useEffect, useRef} from "react";
import {EffekseerManager} from "../effects/EffekseerManager";
import {Effekseer} from "../effects/EffekseerRC";
import {EffectPlayer} from "../effects/EffectPlayer";
import {EffekseerReactContext} from "../effects/EffectContext";

import blockUrl from "../../../Resources/block.efk?url";
import laser1Url from "../../../Resources/Laser01.efk?url";
import laser2Url from "../../../Resources/Laser02.efk?url";
import ribbonParentUrl from "../../../Resources/Simple_Ribbon_Parent.efk?url";
import ribbonSwordUrl from "../../../Resources/Simple_Ribbon_Sword.efk?url";


export function SceneContainer({setEffectNames}: { setEffectNames: (effects: string[]) => void }) {
  // leva controls for scene background color
  const {color, position, rotation, scale} = useControls("Background", {
    color: "#d4d4d4",
    position: {
      value: [0, 0, 0],
      step: .1,
    },
    rotation: {
      value: [0, 0, 0],
      step: .1,
    },
    scale: {
      value: [1, 1, 1],
      step: .1,
    }
  });


  const managerRef = useRef<EffekseerManager>(null);

  const blockRef = useRef<EffectPlayer>(null!);
  // @ts-ignore
  window.blockRef = blockRef;

  const blockRef2 = useRef<EffectPlayer>(null!);
  // @ts-ignore
  window.blockRef2 = blockRef2;

  const laserRef = useRef<EffectPlayer>(null!);

  return (
    <Effekseer ref={managerRef}>
      <color attach="background" args={[color]}/>

      <>
        <mesh castShadow={true} receiveShadow={true}
              onClick={() => laserRef.current?.play()}>
          <sphereGeometry/>
          <meshStandardMaterial color="orange"/>

          <Suspense fallback={null}>
            <Effect ref={laserRef}
                    name={"Laser01"}
                    src={ribbonSwordUrl}
                    debug={true}
                    dispose={null}
                    position={position}
                    rotation={rotation}
                    scale={[0.5, 0.5, 0.5]}
            />
          </Suspense>
        </mesh>


        <mesh position={[5, 1, 0]} castShadow={true} receiveShadow={true}
              onClick={() => blockRef.current?.play()}>
          <boxGeometry/>
          <meshStandardMaterial color="hotpink"/>

          <Suspense fallback={null}>
            <Effect ref={blockRef}
                    name={"block"}
                    src={blockUrl}
                    playOnMount={true}
                    debug
                    position={position}
                    rotation={rotation}
                    scale={scale}
            />
          </Suspense>
        </mesh>


        <mesh position={[-5, 1, 0]} castShadow={true} receiveShadow={true}
              onClick={() => blockRef2.current?.play()}>
          <boxGeometry/>
          <meshStandardMaterial color="hotpink"/>

          <Suspense fallback={null}>
            <Effect ref={blockRef2}
                    name={"block"}
                    src={blockUrl}
                    playOnMount={true}
                    debug
                    position={position}
                    rotation={rotation}
                    scale={scale}
            />
          </Suspense>
        </mesh>
      </>


      <ViewportHelper showGizmo={true} showGrid={true}/>
      <OrbitControls/>
      <SceneLights/>
      <PostProcessing/>


      <TestComponent setEffectNames={setEffectNames}/>

    </Effekseer>
  )
}


function TestComponent({setEffectNames}: { setEffectNames: (effects: string[]) => void }) {
  const {effekseerEffects} = useContext(EffekseerReactContext);

  useEffect(() => {
    console.log("effects updated");
    console.log(effekseerEffects);

    setEffectNames(Object.keys(effekseerEffects));
  }, [effekseerEffects]);

  return null;
}