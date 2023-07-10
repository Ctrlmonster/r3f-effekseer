import {GizmoHelper, GizmoViewport} from "@react-three/drei";
import {folder, useControls} from "leva";

export function ViewportHelper({showGrid = true, showGizmo = true}: { showGrid?: boolean, showGizmo?: boolean }) {
  const {grid, gizmo} = useControls('Viewport', {
    grid: showGrid,
    gizmo: showGizmo
  }, {collapsed: true});

  return (
    <>
      <gridHelper args={[50, 50]} visible={grid}/>
      <GizmoHelper visible={gizmo} alignment="bottom-right" margin={[80, 80]}>
        <GizmoViewport axisColors={['#9d4b4b', '#2f7f4f', '#3b5b9d']} labelColor="white"/>
      </GizmoHelper>
    </>
  )
}