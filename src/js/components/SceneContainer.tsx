import PostProcessing from "./PostProcessing";
import {OrbitControls} from "@react-three/drei";
import {SceneLights} from "./SceneLights";
import {ViewportHelper} from "../helper/ViewportHelper";
import {useControls} from "leva";
import React, {Suspense, useContext, useEffect, useRef} from "react";
import {
  EffectInstance,
  Effekseer,
  effekseerManager,
  EffekseerManager,
  EffekseerReactContext,
  Effect
} from "../../r3f-effekseer";

import blockUrl from "../../../Resources/block.efk?url";
import laser1Url from "../../../Resources/Laser01.efk?url";
import laser2Url from "../../../Resources/Laser02.efk?url";


effekseerManager.preloadEffect("Laser01", laser1Url);


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

  const blockRef = useRef<EffectInstance>(null!);
  // @ts-ignore
  window.blockRef = blockRef;

  const laserRef = useRef<EffectInstance>(null!);
  // @ts-ignore
  window.laserRef = laserRef;

  const laser2Ref = useRef<EffectInstance>(null!);
  // @ts-ignore
  window.laser2Ref = laser2Ref;


  return (
    <Effekseer ref={managerRef}>
      <color attach="background" args={[color]}/>

      <>
        <mesh
          position={[0, 0, -9]}
          castShadow={true} receiveShadow={true}
          onClick={() => laser2Ref.current?.play()}>
          <sphereGeometry/>
          <meshStandardMaterial color="orange"/>

          <Suspense fallback={null}>
            <Effect ref={laser2Ref}
                    name={"Laser02"}
                    src={laser2Url}
                    debug={true}
                    dispose={null}
                    position={position}
                    rotation={rotation}
                    scale={[0.5, 0.5, 0.5]}
                    speed={0.1}
            />
          </Suspense>
        </mesh>

        <mesh
          position={[0, 0, -12]}
          castShadow={true} receiveShadow={true}
          onClick={() => laserRef.current?.play()}>
          <sphereGeometry/>
          <meshStandardMaterial color="hotpink"/>

          <Suspense fallback={null}>
            <Effect ref={laserRef}
                    name={"Laser01"}
                    src={laser1Url}
                    debug={true}
                    dispose={null}
                    position={position}
                    rotation={rotation}
                    scale={[0.5, 0.5, 0.5]}
            />
          </Suspense>
        </mesh>


        <mesh position={[5, 1, 0]} scale={[10, 10, 10]} castShadow={true} receiveShadow={true}
              onClick={() => blockRef.current?.play()}>
          <boxGeometry/>
          <meshStandardMaterial color="gray"/>

          <Suspense fallback={null}>
            <Effect ref={blockRef}
                    name={"block"}
                    src={blockUrl}
                    playOnMount={true}
                    debug
                    position={position}
                    rotation={rotation}
                    scale={[.1, .1, .1]}
                    color={[255, 0, 0, 255]}
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
  const {effects} = useContext(EffekseerReactContext);

  useEffect(() => {
    setEffectNames(Object.keys(effects));
  }, [effects]);

  return null;
}