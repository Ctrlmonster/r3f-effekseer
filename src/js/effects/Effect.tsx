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


export const Effect = forwardRef(({
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

  const [effectPlayer] = useState(new EffectInstance(name, effect, manager));
  useImperativeHandle(ref, () => effectPlayer, []);


  useEffect(() => {
    if (playOnMount) {
      effectPlayer?.play();
    }
    return () => {
      if (dispose != null) {
        manager.disposeEffect(name);
      }
    }
  }, []);

  useEffect(() => {
    if (position) {
      effectPlayer.setPosition(position[0], position[1], position[2]);
    } else {
      effectPlayer.setPosition(0, 0, 0);
    }
  }, [position]);

  useEffect(() => {
    if (rotation) {
      effectPlayer.setRotation(rotation[0], rotation[1], rotation[2]);
    } else {
      effectPlayer.setRotation(0, 0, 0);
    }
  }, [rotation]);

  useEffect(() => {
    if (scale) {
      effectPlayer.setScale(scale[0], scale[1], scale[2]);
    } else {
      effectPlayer.setScale(1, 1, 1);
    }
  }, [scale]);

  useEffect(() => {
    if (speed != undefined) {
      effectPlayer.setSpeed(speed);
    } else {
      effectPlayer.dropSetting("speed");
    }
  }, [speed]);

  useEffect(() => {
    if (visible != undefined) {
      effectPlayer.setVisible(visible);
    } else {
      effectPlayer.dropSetting("visible");
    }
  }, [visible]);

  useEffect(() => {
    if (randomSeed != undefined) {
      effectPlayer.setRandomSeed(randomSeed);
    } else {
      effectPlayer.dropSetting("randomSeed");
    }
  }, [randomSeed]);

  useEffect(() => {
    if (targetPosition != undefined) {
      effectPlayer.setTargetPosition(targetPosition[0], targetPosition[1], targetPosition[2]);
    } else {
      effectPlayer.dropSetting("targetPosition");
    }
  }, [targetPosition]);

  useEffect(() => {
    if (dynamicInput != undefined) {
      for (let i = 0; i < dynamicInput.length; i++)
        effectPlayer.setDynamicInput(i, dynamicInput[i]);
    } else {
      effectPlayer.dropSetting("dynamicInput");
    }
  }, [dynamicInput]);

  useEffect(() => {
    if (color != undefined) {
      effectPlayer.setColor(color[0], color[1], color[2], color[3]);
    } else {
      effectPlayer.dropSetting("color");
    }
  }, [color]);

  useEffect(() => {
    effectPlayer.setPaused(!!paused);
  }, [paused]);


  useFrame(() => {
    // we update only the parent transforms here

    if (effectPlayer) {
      const pos = group.current.getWorldPosition(worldPos.current);
      effectPlayer._setParentPosition(pos.x, pos.y, pos.z);
      effectPlayer.setPosition(effectPlayer._localPosition[0], effectPlayer._localPosition[1], effectPlayer._localPosition[2]);

      const rot = group.current.rotation;
      effectPlayer._setParentRotation(rot.x, rot.y, rot.z);
      effectPlayer.setRotation(effectPlayer._localRotation[0], effectPlayer._localRotation[1], effectPlayer._localRotation[2]);

      const scale = group.current.getWorldScale(worldScale.current);
      effectPlayer._setParentScale(scale.x, scale.y, scale.z);
      effectPlayer.setScale(effectPlayer._localScale[0], effectPlayer._localScale[1], effectPlayer._localScale[2]);
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