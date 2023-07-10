import {folder, useControls} from "leva";
import {useEffect, useRef} from "react";
import {CameraHelper, DirectionalLight} from "three";
import {useThree} from "@react-three/fiber";

export function SceneLights() {
  const directionalLightRef = useRef<DirectionalLight>(null);
  const scene = useThree(state => state.scene);

  const {
    dl_enabled, dl_helper_enabled, dl_castShadow, dl_intensity, dl_position, dl_color,
    al_enabled, al_intensity, al_color,
    pl_enabled, pl_intensity, pl_position, pl_color, pl_castShadow
  } = useControls("Lights", {
    'directionalLight': folder({
      dl_enabled: true,
      dl_helper_enabled: false,
      dl_castShadow: true,
      dl_color: "#ffffff",
      dl_intensity: 1,
      dl_position: [17, 76, 68],
    }, {collapsed: true}),
    'ambientLight': folder({
      al_enabled: true,
      al_intensity: .1,
      al_color: "#ffffff",
    }, {collapsed: true}),
    'pointLight': folder({
      pl_enabled: false,
      pl_castShadow: true,
      pl_color: "#ffffff",
      pl_intensity: 1,
      pl_position: [10, 20, 10],
    }, {collapsed: true}),
  }, {collapsed: true});


  const {fogColor, fogNear, fogFar} = useControls("Fog", {
    fogColor: {value: '#35306a', label: 'Fog Color'},
    fogNear: {value: 17, min: 0, max: 100, label: 'Fog Near'},
    fogFar: {value: 102, min: 0, max: 150, label: 'Fog Far'}
  }, {collapsed: true});


  // Add camera helper to debug directional light shadows
  useEffect(() => {
    if (directionalLightRef.current && dl_helper_enabled) {
      const shadowCameraHelper = new CameraHelper(directionalLightRef.current.shadow.camera);
      scene.add(shadowCameraHelper)
      return () => {
        scene.remove(shadowCameraHelper)
      }
    }
  }, [dl_helper_enabled])


  return (
    <>
      {al_enabled && <ambientLight color={al_color} intensity={al_intensity}/>}
      {dl_enabled && <directionalLight
        ref={directionalLightRef}
        color={dl_color}
        position={dl_position}
        intensity={dl_intensity}
        castShadow={dl_castShadow}
        shadow-mapSize-height={512}
        shadow-mapSize-width={512}
        shadow-camera-far={130}
        shadow-camera-near={60}
        shadow-camera-left={-40}
        shadow-camera-right={40}
        shadow-camera-top={40}
        shadow-camera-bottom={-40}
      />}
      {directionalLightRef.current && dl_helper_enabled &&
        <cameraHelper args={[directionalLightRef.current.shadow.camera]}/>}

      {pl_enabled && <pointLight color={pl_color}
                                 position={pl_position}
                                 intensity={pl_intensity}
                                 castShadow={pl_castShadow}
                                 shadow-mapSize-height={512}
                                 shadow-mapSize-width={512}
      />}

      <fog attach={"fog"} args={[fogColor, fogNear, fogFar]}/>
    </>
  )
}