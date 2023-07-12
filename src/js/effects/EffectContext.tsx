/**
 * A react context
 */

import {EffekseerContext, EffekseerEffect} from "src/js/effects/effekseer/effekseer";
import {createContext} from "react";
import {EffekseerManager} from "./EffekseerManager";


export const effekseerManager = new EffekseerManager();
// @ts-ignore
window.simulation = effekseerManager;

export const EffekseerReactContext = createContext<{
  effekseerEffects: Record<string, EffekseerEffect>
  manager: EffekseerManager
}>({
  effekseerEffects: {},
  manager: effekseerManager
})

export const EffekseerContextProvider = EffekseerReactContext.Provider;






