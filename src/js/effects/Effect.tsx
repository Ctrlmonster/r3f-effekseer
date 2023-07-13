import React, {ForwardedRef, forwardRef, useContext, useEffect, useImperativeHandle, useRef, useState} from "react";
import {Group, Vector3} from "three";
import {EffekseerReactContext} from "./EffectContext";
import {useFrame} from "@react-three/fiber";
import {suspend} from "suspend-react";
import {EffectInstance} from "./EffectInstance";


export type EffectProps = {
  name: string,
  src: string,
  position?: [number, number, number],
  rotation?: [number, number, number],
  scale?: [number, number, number],
  playOnMount?: boolean,
  dispose?: null,
  debug?: boolean,
  onload?: (() => void) | undefined,
  onerror?: ((reason: string, path: string) => void) | undefined,
  redirect?: ((path: string) => string) | undefined,
}


export const Effect = forwardRef(({
                                    src, name,
                                    position, rotation, scale,
                                    onerror, onload, redirect,
                                    playOnMount, dispose, debug
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