import React, {ForwardedRef, forwardRef, useContext, useEffect, useImperativeHandle, useRef, useState} from "react";
import {Group, Vector3} from "three";
import {EffekseerReactContext} from "../EffekseerReactContext";
import {useFrame} from "@react-three/fiber";
import {suspend} from "suspend-react";
import {EffectInstance} from "../EffectInstance";


export type EffektProps = {
  // required props for initialization / loading
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
                                  }: EffektProps, ref: ForwardedRef<EffectInstance>) => {


  const group = useRef<Group>(null!);
  const worldPos = useRef(new Vector3());
  const worldScale = useRef(new Vector3());

  const {manager, effects} = useContext(EffekseerReactContext); // do you add an error if the context is missing?

  const effect = suspend(async () => {
    return await manager.loadEffect(name, src, 1, onload, onerror, redirect);
  }, [src, name]);

  const [effektInstance] = useState(new EffectInstance(name, effect, manager));
  useImperativeHandle(ref, () => effektInstance, []);


  useEffect(() => {
    manager._registerEffectInstance(effektInstance);

    if (playOnMount) {
      effektInstance?.play();
    }
    return () => {
      manager._removeEffectInstance(effektInstance);
      if (dispose != null) {
        manager.disposeEffect(name);
      }
    }
  }, []);

  useEffect(() => {
    if (position) {
      effektInstance.setPosition(position[0], position[1], position[2]);
    } else {
      effektInstance.setPosition(0, 0, 0);
    }
  }, [position]);

  useEffect(() => {
    if (rotation) {
      effektInstance.setRotation(rotation[0], rotation[1], rotation[2]);
    } else {
      effektInstance.setRotation(0, 0, 0);
    }
  }, [rotation]);

  useEffect(() => {
    if (scale) {
      effektInstance.setScale(scale[0], scale[1], scale[2]);
    } else {
      effektInstance.setScale(1, 1, 1);
    }
  }, [scale]);

  useEffect(() => {
    if (speed != undefined) {
      effektInstance.setSpeed(speed);
    } else {
      effektInstance.setSpeed(1);
    }
  }, [speed]);

  useEffect(() => {
    if (visible != undefined) {
      effektInstance.setVisible(visible);
    } else {
      effektInstance.setVisible(true);
    }
  }, [visible]);

  useEffect(() => {
    if (randomSeed != undefined) {
      effektInstance.setRandomSeed(randomSeed);
    } else {
      effektInstance.dropSetting("randomSeed");
    }
  }, [randomSeed]);

  useEffect(() => {
    if (targetPosition != undefined) {
      effektInstance.setTargetPosition(targetPosition[0], targetPosition[1], targetPosition[2]);
    } else {
      effektInstance.dropSetting("targetPosition");
    }
  }, [targetPosition]);

  useEffect(() => {
    if (dynamicInput != undefined) {
      for (let i = 0; i < dynamicInput.length; i++)
        effektInstance.setDynamicInput(i, dynamicInput[i]);
    } else {
      effektInstance.dropSetting("dynamicInput");
    }
  }, [dynamicInput]);

  useEffect(() => {
    if (color != undefined) {
      effektInstance.setColor(color[0], color[1], color[2], color[3]);
    } else {
      effektInstance.dropSetting("color");
    }
  }, [color]);

  useEffect(() => {
    effektInstance.setPaused(!!paused);
  }, [paused]);


  useFrame((_, delta) => {
    // we sync the parent transforms every frame here (effect Instance makes dirty checks internally)
    if (effektInstance && effektInstance.syncedToParent) {
      const pos = group.current.getWorldPosition(worldPos.current);
      effektInstance._setParentPosition(pos.x, pos.y, pos.z);
      effektInstance.setPosition(effektInstance._localPosition[0], effektInstance._localPosition[1], effektInstance._localPosition[2]);

      const rot = group.current.rotation;
      effektInstance._setParentRotation(rot.x, rot.y, rot.z);
      effektInstance.setRotation(effektInstance._localRotation[0], effektInstance._localRotation[1], effektInstance._localRotation[2]);

      const scale = group.current.getWorldScale(worldScale.current);
      effektInstance._setParentScale(scale.x, scale.y, scale.z);
      effektInstance.setScale(effektInstance._localScale[0], effektInstance._localScale[1], effektInstance._localScale[2]);
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