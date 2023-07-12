import {EffekseerEffect, EffekseerHandle} from "src/js/effects/effekseer/effekseer";
import {EffekseerManager} from "./EffekseerManager";


export type EffectPlayerSetting = "paused"
  | "position"
  | "rotation"
  | "scale"
  | "speed";


export class EffectPlayer {
  static #idCounter = 0;
  id = EffectPlayer.#idCounter++;

  latestHandle: EffekseerHandle | null = null;
  activeSettings = new Map<EffectPlayerSetting, { args: any, setter: (...args: any[]) => void }>();

  constructor(public name: string, public effect: EffekseerEffect, public manager: EffekseerManager) {
  }

  play() {
    this.latestHandle = this.manager.playEffect(this.name);
    // whenever we play the effect and get a new handle, we re-run all the setters
    // that the user specified, on the new handle
    for (const {args, setter} of this.activeSettings.values()) {
      setter(...args);
    }
  }

  #setSetting(name: EffectPlayerSetting, args: any[], setter: (...args: any[]) => void) {
    this.activeSettings.set(name, {args, setter});
  }

  dropSetting(name: EffectPlayerSetting) {
    this.activeSettings.delete(name);
  }

  // --- setters for specific settings ---

  setPosition(x: number, y: number, z: number) {
    this.#setSetting("position", [x, y, z], () => this.latestHandle?.setLocation(x, y, z));
    this.latestHandle?.setLocation(x, y, z);
  }

  setRotation(x: number, y: number, z: number) {
    this.#setSetting("rotation", [x, y, z], () => this.latestHandle?.setRotation(x, y, z));
    this.latestHandle?.setRotation(x, y, z);
  }

  setScale(x: number, y: number, z: number) {
    this.#setSetting("scale", [x, y, z], () => this.latestHandle?.setScale(x, y, z));
    this.latestHandle?.setScale(x, y, z);
  }

  setSpeed(speed: number) {
    this.#setSetting("speed", [speed], () => this.latestHandle?.setSpeed(speed));
    this.latestHandle?.setSpeed(speed);
  }

}