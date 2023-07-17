import {createContext} from "react";
import {effekseerManager, EffekseerManager} from "./EffekseerManager";
import {EffekseerEffect} from "../index";

export const EffekseerReactContext = createContext<{
  effects: Record<string, EffekseerEffect>
  manager: EffekseerManager
}>({
  effects: {},
  manager: effekseerManager
})







