import {EffekseerHandle, EffekseerEffect} from "./index";
import {EffekseerManager} from "./EffekseerManager";


export type EffectInstanceSetting = "paused"
  | "position"
  | "rotation"
  | "scale"
  | "speed"
  | "randomSeed"
  | "visible"
  | "matrix"
  | "dynamicInput"
  | "targetPosition"
  | "color"


// TODO: figure out a way to return a promise for .play()

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
  // the effect is playing. The purpose of this class is to give
  // the user a way to set settings in a persistent manner. Each time
  // EffectInstance.play() is called a new handle is created, we make
  // sure that previously assigned settings, are carried over to the
  // new handle.
  _latestHandle: EffekseerHandle | null = null;

  _dynamicInputs: (number | undefined)[] = [];

  #activateSettingByName = new Map<EffectInstanceSetting, (...args: any[]) => void>();
  #paused = false;

  // -------------------------------------------------------------------------------------------------------------------

  constructor(public name: string, public effect: EffekseerEffect, public manager: EffekseerManager) {
  }

  // -------------------------------------------------------------------------------------------------------------------
  // Playback methods


  /**
   * Start playing the effect with the currently active settings. This method always starts the
   * effect anew. If you want to unpause the effect instead, call EffectInstance.setPaused(false).
   * There is also an optional parameter to let the previous running instance of this effect
   * continue while starting the effect new. You are not able to interact with the previous
   * running instance in any way, after calling play().
   * @param continuePrevious If true, this will not stop the previous running effect
   */
  play(continuePrevious: boolean = false) {
    if (this.manager) {
      this.#paused = false;
      !continuePrevious && this._latestHandle?.stop();
      this._latestHandle = this.manager.playEffect(this.name) || null;
      // whenever we play the effect and get a new handle, we re-run all the setters
      // that the user specified, on the new handle
      for (const activateSetting of this.#activateSettingByName.values()) {
        activateSetting();
      }
    }
  }

  /**
   * Set the paused flag of this effect instance.
   * if specified true, this effect playing will not advance.
   * Call setPaused(false) to unpause an effect.
   * @param {boolean} paused Paused flag
   */
  setPaused(paused: boolean) {
    this.#paused = paused;
    this._prepareSetting("paused", () => this._latestHandle!.setPaused(paused));
    this._latestHandle?.setPaused(paused);
  }

  /**
   * Whether the effect is currently paused. Call .setPaused(false) to continue
   * a paused effect. EffectInstance.play() will always start a new effect.
   */
  get paused() {
    return this.#paused;
  }


  // Stop and StopRoot don't get saved as settings. They only get applied to the current effect handle.
  /**
   * Stop this effect instance.
   */
  stop() {
    this._latestHandle?.stop();
  }

  /**
   * Stop the root node of this effect instance.
   */
  stopRoot() {
    this._latestHandle?.stopRoot();
  }

  // -------------------------------------------------------------------------------------------------------------------

  /**
   * Get the names of all the settings that are currently active.
   */
  get activeSettings(): EffectInstanceSetting[] {
    return [...this.#activateSettingByName.keys()];
  }

  /**
   * Sets a setting that should be applied to the effect handle, next time
   * EffectInstance.play() is called. This will not affect the currently playing
   * effect if there is one. This method is usually only called internally, and you
   * should check if there isn't a method that sets your setting directly.
   * If you have need for it anyway, you can call it likely this:
   * <pre>
   *   effectInstance._prepareSetting("speed", () => effectInstance._latestHandle!.setSpeed(speed))
   * </pre>
   * @param name
   * @param activateSetting
   */
  _prepareSetting(name: EffectInstanceSetting, activateSetting: () => void) {
    this.#activateSettingByName.set(name, activateSetting);
  }

  /**
   * Drop an effect setting. The next time the effect is played, this setting will not be applied to it.
   * @param name
   */
  dropSetting(name: EffectInstanceSetting) {
    this.#activateSettingByName.delete(name);
  }

  // -------------------------------------------------------------------------------------------------------------------

  // Transform Setters - These have a bit more dirty checking and stuff going on,
  // because they get called every frame from the <Effect> RC


  /**
   * Set the local position of this effect instance.
   * This position is relative to the parent position,
   * which the <Effect> RC updates each frame through
   * effectInstance_setParentPosition().
   */
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

      this._prepareSetting("position", () => this._latestHandle!.setLocation(globalX, globalY, globalZ));
      this._latestHandle?.setLocation(globalX, globalY, globalZ); // if the effect is currently playing
    }
  }

  /**
   * Warning: Only call this method if you created this
   * EffectInstance imperatively!<br/>
   * The parent position of this effect. If this EffectInstance
   * was created through a <Effect> React component, that component
   * will call this method each frame, which will override your custom
   * parent position.
   */
  _setParentPosition(x: number, y: number, z: number) {
    if (x !== this._parentPosition[0] || y !== this._parentPosition[1] || z !== this._parentPosition[2]) {
      this._parentPosition[0] = x;
      this._parentPosition[1] = y;
      this._parentPosition[2] = z;
      this._parentPositionDirty = true;
    }
  }

  /**
   * Set the local rotation of this effect instance.
   * This rotation gets added on top of the parent rotation,
   * which the <Effect> RC updates each frame through
   * _setParentRotation().
   */
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

      this._prepareSetting("rotation", () => this._latestHandle!.setRotation(globalX, globalY, globalZ));
      this._latestHandle?.setRotation(globalX, globalY, globalZ); // if the effect is currently playing
    }
  }

  /**
   * Warning: Only call this method if you created this
   * EffectInstance imperatively!<br/>
   * The parent rotation of this effect. If this EffectInstance
   * was created through a <Effect> React component, that component
   * will call this method each frame, which will override your custom
   * parent rotation.
   */
  _setParentRotation(x: number, y: number, z: number) {
    if (x !== this._parentRotation[0] || y !== this._parentRotation[1] || z !== this._parentRotation[2]) {
      this._parentRotation[0] = x;
      this._parentRotation[1] = y;
      this._parentRotation[2] = z;
      this._parentRotationDirty = true;
    }
  }


  /**
   * Set the local position of this effect instance.
   * This scale is multiplied on top of the parent scale,
   * which the <Effect> RC updates each frame through
   * effectInstance_setParentScale().
   */
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

      this._prepareSetting("scale", () => this._latestHandle!.setScale(globalX, globalY, globalZ));
      this._latestHandle?.setScale(globalX, globalY, globalZ); // if the effect is currently playing
    }
  }


  /**
   * Warning: Only call this method if you created this
   * EffectInstance imperatively!<br/>
   * The parent scale of this effect. If this EffectInstance
   * was created through a <Effect> React component, that component
   * will call this method each frame, which will override your custom
   * parent scale.
   */
  _setParentScale(x: number, y: number, z: number) {
    if (x !== this._parentScale[0] || y !== this._parentScale[1] || z !== this._parentScale[2]) {
      this._parentScale[0] = x;
      this._parentScale[1] = y;
      this._parentScale[2] = z;
      this._parentScaleDirty = true;
    }
  }

  // -------------------------------------------------------------------------------------------------------------------


  /**
   * Set the playback speed of this effect.
   * @param {number} speed Speed ratio
   */
  setSpeed(speed: number) {
    this._prepareSetting("speed", () => this._latestHandle!.setSpeed(speed));
    this._latestHandle?.setSpeed(speed);
  }

  /**
   * Set the random seed of this effect.
   * @param {number} randomSeed random seed
   */
  setRandomSeed(randomSeed: number) {
    this._prepareSetting("randomSeed", () => this._latestHandle!.setRandomSeed(randomSeed));
    this._latestHandle?.setRandomSeed(randomSeed);
  }


  /**
   * Set the visible flag of this effect instance.
   * if specified false, this effect will be invisible.
   * @param {boolean} shown Shown flag
   */
  setVisible(shown: boolean) {
    this._prepareSetting("visible", () => this._latestHandle!.setShown(shown));
    this._latestHandle?.setShown(shown);
  }

  /**
   * Set the target position of this effect instance.
   */
  setTargetPosition(x: number, y: number, z: number) {
    this._prepareSetting("targetPosition", () => this._latestHandle!.setTargetLocation(x, y, z));
    this._latestHandle?.setTargetLocation(x, y, z);
  }

  /**
   * Set the color of this effect instance.
   * @param {number} r R channel value of color
   * @param {number} g G channel value of color
   * @param {number} b B channel value of color
   * @param {number} a A channel value of color
   */
  setColor(r: number, g: number, b: number, a: number) {
    this._prepareSetting("color", () => this._latestHandle!.setAllColor(r, g, b, a));
    this._latestHandle?.setAllColor(r, g, b, a);
  }

  /**
   * Set the model matrix of this effect instance.
   * @param {array} matrixArray An array that is required 16 elements
   */
  setMatrix(matrixArray: Float32Array) {
    this._prepareSetting("matrix", () => this._latestHandle!.setMatrix(matrixArray));
    this._latestHandle?.setMatrix(matrixArray);
  }


  // -------------------------------------------------------------------------------------------------------------------

  /**
   * Specify a dynamic parameter, which changes effect parameters dynamically while playing
   * @param {number} index slot index
   * @param {number} value value
   */
  setDynamicInput(index: number, value: number | undefined) {
    this._dynamicInputs[index] = value;
    this._prepareSetting("dynamicInput", () => {
      for (let i = 0; i < this._dynamicInputs.length; i++) {
        const v = this._dynamicInputs[i];
        if (v != undefined) {
          this._latestHandle!.setDynamicInput(i, v);
        }
      }
    });
    if (value != undefined) this._latestHandle?.setDynamicInput(index, value);
  }

  /**
   * get a dynamic parameter, which changes effect parameters dynamically while playing
   * @param {number} index slot index
   */
  getDynamicInput(index: number): number | undefined {
    return this._dynamicInputs[index];
  }

  // -------------------------------------------------------------------------------------------------------------------


  /**
   * Sends the specified trigger to the currently playing effect. The trigger value is not saved
   * after the effect finished playing. If you call .play() again, all previous trigger values are reset.
   * @param {number} index trigger index
   */
  sendTrigger(index: number) {
    this._latestHandle?.sendTrigger(index);
  }

}