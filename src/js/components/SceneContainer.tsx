import PostProcessing from "./PostProcessing";
import {OrbitControls} from "@react-three/drei";
import {useThree} from "@react-three/fiber";
import {SceneLights} from "./SceneLights";
import {ViewportHelper} from "../helper/ViewportHelper";
import {useControls} from "leva";
import {Effekseer} from "../effects/EffectContext";
import {Effect} from "../effects/Effect";


import blockUrl from "../../../Resources/block.efk?url";
import laserUrl from "../../../Resources/Laser01.efk?url";
import {EffekseerEffect} from "src/js/effects/effekseer/effekseer";
import {useRef} from "react";


export function SceneContainer({setEffects}: { setEffects: (effects: string[]) => void }) {
  const state = useThree(({gl, scene, camera, clock}) => ({gl, scene, camera, clock}));

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
      value: [.2, .2, .2],
      step: .1,
    }
  });

  const laserRef = useRef<EffekseerEffect>(null);

  console.log(laserRef);

  return (
    <Effekseer>
      <color attach="background" args={[color]}/>

      <>
        <mesh position={[0, 0, -1]} scale={[0.5, 0.5, 0.5]} castShadow={true} receiveShadow={true}>
          <sphereGeometry/>
          <meshStandardMaterial color="orange"/>

          <Effect name={"Laser01"}
                  src={laserUrl}
                  playOnMount={true}
                  position={position}
                  rotation={rotation}
                  scale={scale}
          />
        </mesh>

        <mesh position={[15, 1, 1]} castShadow={true} receiveShadow={true}>
          <boxGeometry/>
          <meshStandardMaterial color="hotpink"/>

          <Effect name={"block"}
                  src={blockUrl}
                  playOnMount={true}
                  position={position}
                  rotation={rotation}
                  scale={scale}
          />
        </mesh>
      </>



      <Effect
        ref={laserRef}
        name={"Laser01"}
        src={laserUrl}
        position={[7, 0, 0]}
        rotation={rotation}
        playOnMount={true}
      />


      <ViewportHelper showGizmo={true} showGrid={true}/>
      <OrbitControls/>
      <SceneLights/>
      <PostProcessing/>
    </Effekseer>
  )
}
