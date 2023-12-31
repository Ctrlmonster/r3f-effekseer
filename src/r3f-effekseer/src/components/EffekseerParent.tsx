import {ForwardedRef, forwardRef, ReactNode, useImperativeHandle, useLayoutEffect, useMemo, useState} from "react";
import {useFrame, useThree} from "@react-three/fiber";
import {
  EffekseerEffect,
  EffekseerManager,
  effekseerManager,
  EffekseerReactContext,
  EffekseerSettings
} from "../../index";


export const Effekseer = forwardRef(({children, settings, ejectRenderer}: {
  children: ReactNode,
  settings?: EffekseerSettings,
  ejectRenderer?: boolean
}, ref: ForwardedRef<EffekseerManager>) => {

  const [effects, setEffects] = useState<Record<string, EffekseerEffect>>({});
  const {gl, scene, camera, clock} = useThree(({gl, scene, camera, clock}) => ({gl, scene, camera, clock}));

  useImperativeHandle(ref, () => effekseerManager, []);
  useLayoutEffect(() => {
    // init the simulation - this is how you get access
    // to scene, camera, renderer etc. from your imperative code.
    effekseerManager.init(
      gl,
      scene,
      camera,
      clock,
      settings || null,
      setEffects
    );

    return () => {
      effekseerManager.destroy();
    }
  }, [settings, gl, scene, camera, clock]);


  useFrame((state, delta) => {
    // connecting the simulation to r3f's render loop,
    // it will now get updated every frame
    if (!ejectRenderer) {
      gl.render(scene, camera);
    }
    effekseerManager.update(delta, !ejectRenderer);
  }, ejectRenderer ? undefined : 1);


  return (
    <EffekseerReactContext.Provider value={{
      effects: effects,
      manager: effekseerManager
    }}>
      {children}
    </EffekseerReactContext.Provider>
  )
});
