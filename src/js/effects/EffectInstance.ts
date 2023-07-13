import {EffekseerEffect, EffekseerHandle} from "src/js/effects/effekseer/effekseer";
import {EffekseerManager} from "./EffekseerManager";


export type EffectInstanceSetting = "paused"
  | "position"
  | "rotation"
  | "scale"
  | "speed";


export class EffectInstance {
  static #idCounter = 0;
  id = EffectInstance.#idCounter++;

  // we got parent transforms, which can optionally be set to have
  // transform own relative to parent. The React Component uses these
  // to sync effect transforms to the parent in the Scene Tree.
  _parentPosition = [0, 0, 0];
  _parentPositionDirty: boolean = false;

  _parentRotation = [0, 0, 0];
  _parentRotationDirty: boolean = false;

  _parentScale = [1, 1, 1];
  _parentScaleDirty: boolean = false;

  // local transforms should always be set through the designated setters
  _localPosition = [0, 0, 0];
  _localRotation = [0, 0, 0];
  _localScale = [1, 1, 1];

  // EffekseerHandles are fleeting: They are only valid as long as
  // the effect is playing. We provide full API coverage for EffekseerHandle,
  // that's why we make the current handle private and let the GC dispose it
  // as soon as effekseer does no longer use it internally.
  #latestHandle: EffekseerHandle | null = null;
  #activateSettingByName = new Map<EffectInstanceSetting, (...args: any[]) => void>();


  constructor(public name: string, public effect: EffekseerEffect, public manager: EffekseerManager) {
  }

  /**
   * Get the names of all the settings that are currently active.
   */
  get activeSettings(): EffectInstanceSetting[] {
    return [...this.#activateSettingByName.keys()];
  }

  /**
   * Play the effect with the current settings.
   * @param stopPrevious If true, the previous effect will be stopped before playing the new one.
   */
  play(stopPrevious: boolean = true) {
    if (this.manager) {
      stopPrevious && this.#latestHandle?.stop();
      this.#latestHandle = this.manager.playEffect(this.name);
      // whenever we play the effect and get a new handle, we re-run all the setters
      // that the user specified, on the new handle
      for (const activateSetting of this.#activateSettingByName.values()) {
        activateSetting();
      }
    }
  }

  #setSetting(name: EffectInstanceSetting, activateSetting: (...args: any[]) => void) {
    this.#activateSettingByName.set(name, activateSetting);
  }

  /**
   * Next time the effect is played, this setting will not be applied to it.
   * @param name
   */
  dropSetting(name: EffectInstanceSetting) {
    this.#activateSettingByName.delete(name);
  }

  // --- setters for specific settings ---

  setPosition(x: number, y: number, z: number) {
    if (this._parentPositionDirty
      || x !== this._localPosition[0]
      || y !== this._localPosition[1]
      || z !== this._localPosition[2]) {

      this._localPosition[0] = x;
      this._localPosition[1] = y;
      this._localPosition[2] = z;

      const globalX = x + this._parentPosition[0];
      const globalY = y + this._parentPosition[1];
      const globalZ = z + this._parentPosition[2];
      this._parentPositionDirty = false;

      this.#setSetting("position", () => this.#latestHandle!.setLocation(globalX, globalY, globalZ));
      this.#latestHandle?.setLocation(globalX, globalY, globalZ); // if the effect is currently playing
    }
  }

  _setParentPosition(x: number, y: number, z: number) {
    if (x !== this._parentPosition[0] || y !== this._parentPosition[1] || z !== this._parentPosition[2]) {
      this._parentPosition[0] = x;
      this._parentPosition[1] = y;
      this._parentPosition[2] = z;
      this._parentPositionDirty = true;
    }
  }

  setRotation(x: number, y: number, z: number) {
    if (this._parentRotationDirty
      || x !== this._localRotation[0]
      || y !== this._localRotation[1]
      || z !== this._localRotation[2]) {

      this._localRotation[0] = x;
      this._localRotation[1] = y;
      this._localRotation[2] = z;

      const globalX = x + this._parentRotation[0];
      const globalY = y + this._parentRotation[1];
      const globalZ = z + this._parentRotation[2];
      this._parentRotationDirty = false;

      this.#setSetting("rotation", () => this.#latestHandle!.setRotation(globalX, globalY, globalZ));
      this.#latestHandle?.setRotation(globalX, globalY, globalZ); // if the effect is currently playing
    }
  }

  _setParentRotation(x: number, y: number, z: number) {
    if (x !== this._parentRotation[0] || y !== this._parentRotation[1] || z !== this._parentRotation[2]) {
      this._parentRotation[0] = x;
      this._parentRotation[1] = y;
      this._parentRotation[2] = z;
      this._parentRotationDirty = true;
    }
  }

  setScale(x: number, y: number, z: number) {
    if (this._parentScaleDirty
      || x !== this._localScale[0]
      || y !== this._localScale[1]
      || z !== this._localScale[2]) {

      this._localScale[0] = x;
      this._localScale[1] = y;
      this._localScale[2] = z;

      const globalX = x * this._parentScale[0];
      const globalY = y * this._parentScale[1];
      const globalZ = z * this._parentScale[2];
      this._parentScaleDirty = false;

      this.#setSetting("scale", () => this.#latestHandle!.setScale(globalX, globalY, globalZ));
      this.#latestHandle?.setScale(globalX, globalY, globalZ); // if the effect is currently playing
    }
  }

  _setParentScale(x: number, y: number, z: number) {
    if (x !== this._parentScale[0] || y !== this._parentScale[1] || z !== this._parentScale[2]) {
      this._parentScale[0] = x;
      this._parentScale[1] = y;
      this._parentScale[2] = z;
      this._parentScaleDirty = true;
    }
  }

  setSpeed(speed: number) {
    this.#setSetting("speed", () => this.#latestHandle!.setSpeed(speed));
    this.#latestHandle?.setSpeed(speed);
  }

}