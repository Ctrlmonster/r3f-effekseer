import React, {ForwardedRef, forwardRef, useContext, useEffect, useImperativeHandle, useRef, useState} from "react";
import {Group, Vector3} from "three";
import {EffekseerReactContext} from "./EffectContext";
import {useFrame} from "@react-three/fiber";
import {suspend} from "suspend-react";
import {EffectInstance} from "./EffectInstance";


export type EffectProps = {
  // initialization / loading

  name: string,
  src: string,
  // -----------------------------------------
  // effect settings

  position?: [x: number, y: number, z: number],
  rotation?: [x: number, y: number, z: number],
  scale?: [x: number, y: number, z: number],

  speed?: number,
  randomSeed?: number,
  visible?: boolean,
  dynamicInput?: (number | undefined)[],
  targetPosition?: [x: number, y: number, z: number],

  // colors values between 0 and 255
  color?: [r: number, g: number, b: number, alpha: number],
  paused?: boolean,

  // -----------------------------------------
  // r3f specifics

  playOnMount?: boolean,
  dispose?: null,
  debug?: boolean,
  // -----------------------------------------
  // loading callbacks

  onload?: (() => void) | undefined,
  onerror?: ((reason: string, path: string) => void) | undefined,
  redirect?: ((path: string) => string) | undefined,
}


export const Effekt = forwardRef(({
                                    src, name,
                                    position, rotation, scale,
                                    speed, visible, randomSeed, targetPosition,
                                    dynamicInput, color, paused,
                                    playOnMount, dispose, debug,
                                    onerror, onload, redirect,
                                  }: EffectProps, ref: ForwardedRef<EffectInstance>) => {


  const group = useRef<Group>(null!);
  const worldPos = useRef(new Vector3());
  const worldScale = useRef(new Vector3());

  const {manager} = useContext(EffekseerReactContext); // do you add an error if the context is missing?

  const effect = suspend(async () => {
    return await manager.loadEffect(name, src, 1, onload, onerror, redirect);
  }, [src, name]);

  const [effectInstance] = useState(new EffectInstance(name, effect, manager));
  useImperativeHandle(ref, () => effectInstance, []);


  useEffect(() => {
    if (playOnMount) {
      effectInstance?.play();
    }
    return () => {
      if (dispose != null) {
        manager.disposeEffect(name);
      }
    }
  }, []);

  useEffect(() => {
    if (position) {
      effectInstance.setPosition(position[0], position[1], position[2]);
    } else {
      effectInstance.setPosition(0, 0, 0);
    }
  }, [position]);

  useEffect(() => {
    if (rotation) {
      effectInstance.setRotation(rotation[0], rotation[1], rotation[2]);
    } else {
      effectInstance.setRotation(0, 0, 0);
    }
  }, [rotation]);

  useEffect(() => {
    if (scale) {
      effectInstance.setScale(scale[0], scale[1], scale[2]);
    } else {
      effectInstance.setScale(1, 1, 1);
    }
  }, [scale]);

  useEffect(() => {
    if (speed != undefined) {
      effectInstance.setSpeed(speed);
    } else {
      effectInstance.setSpeed(1);
    }
  }, [speed]);

  useEffect(() => {
    if (visible != undefined) {
      effectInstance.setVisible(visible);
    } else {
      effectInstance.setVisible(true);
    }
  }, [visible]);

  useEffect(() => {
    if (randomSeed != undefined) {
      effectInstance.setRandomSeed(randomSeed);
    } else {
      effectInstance.dropSetting("randomSeed");
    }
  }, [randomSeed]);

  useEffect(() => {
    if (targetPosition != undefined) {
      effectInstance.setTargetPosition(targetPosition[0], targetPosition[1], targetPosition[2]);
    } else {
      effectInstance.dropSetting("targetPosition");
    }
  }, [targetPosition]);

  useEffect(() => {
    if (dynamicInput != undefined) {
      for (let i = 0; i < dynamicInput.length; i++)
        effectInstance.setDynamicInput(i, dynamicInput[i]);
    } else {
      effectInstance.dropSetting("dynamicInput");
    }
  }, [dynamicInput]);

  useEffect(() => {
    if (color != undefined) {
      effectInstance.setColor(color[0], color[1], color[2], color[3]);
    } else {
      effectInstance.dropSetting("color");
    }
  }, [color]);

  useEffect(() => {
    effectInstance.setPaused(!!paused);
  }, [paused]);


  useFrame(() => {
    // we sync the parent transforms every frame here (effect Instance makes dirty checks internally)
    if (effectInstance) {
      const pos = group.current.getWorldPosition(worldPos.current);
      effectInstance._setParentPosition(pos.x, pos.y, pos.z);
      effectInstance.setPosition(effectInstance._localPosition[0], effectInstance._localPosition[1], effectInstance._localPosition[2]);

      const rot = group.current.rotation;
      effectInstance._setParentRotation(rot.x, rot.y, rot.z);
      effectInstance.setRotation(effectInstance._localRotation[0], effectInstance._localRotation[1], effectInstance._localRotation[2]);

      const scale = group.current.getWorldScale(worldScale.current);
      effectInstance._setParentScale(scale.x, scale.y, scale.z);
      effectInstance.setScale(effectInstance._localScale[0], effectInstance._localScale[1], effectInstance._localScale[2]);
    }
  });


  return (
    <group ref={group}>
      {(debug) ?
        <mesh position={position} rotation={rotation} scale={scale}>
          <coneGeometry args={[1, 1, 6, 1]}/>
          <meshBasicMaterial color={"#aa00ff"} wireframe={true}/>
        </mesh>
        : null
      }
    </group>
  )
});