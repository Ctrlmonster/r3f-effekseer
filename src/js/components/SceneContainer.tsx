import PostProcessing from "./PostProcessing";
import {OrbitControls} from "@react-three/drei";
import {useThree} from "@react-three/fiber";
import {SceneLights} from "./SceneLights";
import {ViewportHelper} from "../helper/ViewportHelper";
import {useControls} from "leva";
import {Effect} from "../effects/Effect";


import blockUrl from "../../../Resources/block.efk?url";
import laserUrl from "../../../Resources/Laser01.efk?url";
import {EffekseerEffect} from "src/js/effects/effekseer/effekseer";
import {Suspense, useEffect, useRef} from "react";
import {EffekseerManager} from "../effects/EffekseerManager";
import {Effekseer} from "../effects/EffekseerRC";
import {EffectPlayer} from "../effects/EffectPlayer";


export function SceneContainer({setEffects}: { setEffects: (effects: string[]) => void }) {
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
  console.log(managerRef);


  const blockRef = useRef<EffectPlayer>(null!);
  // @ts-ignore
  window.blockRef = blockRef;

  const laserRef = useRef<EffectPlayer>(null!);
  // @ts-ignore
  window.laserRef = laserRef;

  return (
    <Effekseer ref={managerRef}>
      <color attach="background" args={[color]}/>

      <>
        <mesh position={[0, 0, -1]} scale={[1, 1, 1]}
              castShadow={true} receiveShadow={true}
              onClick={() => laserRef.current?.play()}>
          <sphereGeometry/>
          <meshStandardMaterial color="orange"/>

          <Suspense fallback={null}>
            <Effect ref={laserRef}
                    name={"Laser01"}
                    src={laserUrl}
                    playOnMount={true}
                    debug={true}
                    dispose={null}
                    position={position}
                    rotation={rotation}
                    scale={[0.5, 0.5, 0.5]}
            />
          </Suspense>
        </mesh>


        <mesh position={[15, 1, 1]} scale={[0.1, 0.1, 0.1]} castShadow={true} receiveShadow={true}>
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
      </>


      <ViewportHelper showGizmo={true} showGrid={true}/>
      <OrbitControls/>
      <SceneLights/>
      <PostProcessing/>
    </Effekseer>
  )
}
