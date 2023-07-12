import {EffekseerContext, EffekseerEffect} from "src/js/effects/effekseer/effekseer";
import {ForwardedRef, forwardRef, ReactNode, useImperativeHandle, useLayoutEffect, useState} from "react";
import {useFrame, useThree} from "@react-three/fiber";
import {EffekseerManager} from "./EffekseerManager";
import {EffekseerContextProvider, effekseerManager} from "./EffectContext";


// TODO: needs to be able to accept new camera, scene, clock, etc.

export const Effekseer = forwardRef(({children}: { children: ReactNode }, ref: ForwardedRef<EffekseerManager>) => {
  const [effects, setEffects] = useState<Record<string, EffekseerEffect>>({});

  const state = useThree(({gl, scene, camera, clock}) => ({gl, scene, camera, clock}));

  useImperativeHandle(ref, () => effekseerManager, []);

  useLayoutEffect(() => {
    // init the simulation - this is how you get access
    // to scene, camera, renderer etc. from your imperative code.
    effekseerManager.init(state.gl, state.scene, state.camera, state.clock, setEffects);
    return () => {
      effekseerManager.destroy();
    }
  }, []);


  useFrame((state, delta) => {
    // connecting the simulation to r3f's render loop,
    // it will now get updated every frame
    effekseerManager.update(delta);
  }, 1)


  return (
    <EffekseerContextProvider value={{
      effekseerEffects: effects,
      manager: effekseerManager
    }}>
      {children}
    </EffekseerContextProvider>
  )
});
