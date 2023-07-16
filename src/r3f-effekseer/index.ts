// classes / objects
export {EffekseerReactContext} from "./EffekseerReactContext";
export {EffectInstance} from "./EffectInstance";
export {EffekseerManager, effekseerManager} from "./EffekseerManager";

// effekseer native type exports
export type {EffekseerContext, EffekseerEffect, EffekseerHandle} from "effekseer-native"

// exporting effekseer setup object - doesn't work
import {effekseer as effekseerSetup} from "./effekseer/effekseer.src";

export const effekseer = effekseerSetup();
console.log(effekseer); // TODO: Recursion error if effekseer.js isn't import via <script> first

// react components
export {Effekseer} from "./components/EffekseerParent";
export {Effect} from "./components/Effect";

// types
export type {EffectProps} from "./components/Effect";
export type {EffectInstanceSetting} from "./EffectInstance";
export type {EffekseerSettings, EffectLoadingPackage} from "./EffekseerManager";

