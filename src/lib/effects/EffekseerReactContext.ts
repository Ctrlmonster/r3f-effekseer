/**
 * A react context
 */


import {createContext} from "react";
import {effekseerManager, EffekseerManager} from "./EffekseerManager";
import {EffekseerEffect} from "..";

export const EffekseerReactContext = createContext<{
  effects: Record<string, EffekseerEffect>
  manager: EffekseerManager
}>({
  effects: {},
  manager: effekseerManager
})






