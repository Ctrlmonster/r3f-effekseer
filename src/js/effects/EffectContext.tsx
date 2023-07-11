/**
 * A react context
 */

import {EffekseerContext, EffekseerEffect} from "src/js/effects/effekseer/effekseer";
import {createContext, ReactNode, useLayoutEffect, useState} from "react";
import {useFrame, useThree} from "@react-three/fiber";
import {EffekseerManager} from "./EffekseerManager";


const effekseerManager = new EffekseerManager();
// @ts-ignore
window.simulation = effekseerManager;

export const EffekseerReactContext = createContext<{
  effekseerContext: EffekseerContext | null,
  effekseerEffects: Record<string, EffekseerEffect>
  effectNames: string[],
  manager: EffekseerManager
}>({
  effekseerContext: null,
  effekseerEffects: {},
  effectNames: [],
  manager: effekseerManager
})

export const EffekseerContextProvider = EffekseerReactContext.Provider;



export function Effekseer({children}: { children: ReactNode }) {
  const [effectNames, setEffectNames] = useState<string[]>([]);
  const [effects, setEffects] = useState<Record<string, EffekseerEffect>>({});
  const [context, setContext] = useState<EffekseerContext | null>(null);
  const state = useThree(({gl, scene, camera, clock}) => ({gl, scene, camera, clock}));


  useLayoutEffect(() => {
    // init the simulation - this is how you get access
    // to scene, camera, renderer etc. from your imperative code.
    effekseerManager.init(state.gl, state.scene, state.camera, state.clock, (effects, context) => {
      setEffectNames(Object.keys(effects));
      setEffects(effects);
      setContext(context);
    });
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
      effekseerContext: context,
      effekseerEffects: effects,
      effectNames: effectNames,
      manager: effekseerManager
    }}>
      {children}
    </EffekseerContextProvider>
  )
}


