import {useEffect} from "react";
import {invalidate} from "@react-three/fiber";
import {useControls} from "leva";


/**
 * This hook will set render on demand depending on the initial value prop, expose a leva binding control for it
 * and automatically call invalidate on mouseMove. This is mainly a helper during development, so that
 * your canvas doesn't render all the time. If you want to use render on demand in production you have
 * to call invalidate yourself whenever you want to re-render.
 */
export function useRenderOnDemand(initialValue: boolean = true) {
  const {renderOnDemand} = useControls({renderOnDemand: initialValue});

  useEffect(() => {
    const inv = () => renderOnDemand && invalidate();
    window.addEventListener("mousemove", inv);
    return () => {
      window.removeEventListener("mousemove", inv);
    }
  }, [renderOnDemand]);

  return renderOnDemand;
}