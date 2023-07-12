import React, {ForwardedRef, forwardRef, useContext, useEffect, useImperativeHandle, useRef, useState} from "react";
import {Group, Vector3} from "three";
import {EffekseerReactContext} from "./EffectContext";
import {useFrame} from "@react-three/fiber";
import {suspend} from "suspend-react";
import {EffectPlayer} from "./EffectPlayer";


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


// TODO:Current problem - the ref is being ovewritten

export const Effect = forwardRef(({
                                    src, name,
                                    position, rotation, scale,
                                    onerror, onload, redirect,
                                    playOnMount, dispose, debug
                                  }: EffectProps, ref: ForwardedRef<EffectPlayer>) => {

  const group = useRef<Group>(null!);
  const worldPos = useRef(new Vector3());
  const worldScale = useRef(new Vector3());

  const {manager} = useContext(EffekseerReactContext); // do you add an error if the context is missing?

  const effect = suspend(async () => {
    // it's always the same effectPlayer
    return await manager.loadEffect(name, src, 1, onload, onerror, redirect);
  }, [src, name]);

  const [effectPlayer] = useState(new EffectPlayer(name, effect, manager));


  useImperativeHandle(ref, () => effectPlayer, []);

  useEffect(() => {
    if (playOnMount) {
      //effectHandle.current = manager.playEffect(name);
      effectPlayer?.play();
    }
    return () => {
      if (dispose != null) {
        manager.disposeEffect(name);
      }
    }
  }, []);

  // TODO: if the user sets the position on the player ref, then we need to update the group position

  useFrame(() => {
    if (effectPlayer) {
      const pos = group.current.getWorldPosition(worldPos.current);
      effectPlayer.setPosition(pos.x, pos.y, pos.z);

      const rot = group.current.rotation;
      effectPlayer.setRotation(rot.x, rot.y, rot.z);

      const scale = group.current.getWorldScale(worldScale.current);
      effectPlayer.setScale(scale.x, scale.y, scale.z);
    }
  });

  return (
    <group ref={group} position={position} rotation={rotation} scale={scale}>
      {debug ?
        <mesh rotation={rotation}>
          <coneGeometry args={[1, 1, 6, 1]}/>
          <meshBasicMaterial color={"#aa00ff"} wireframe={true}/>
        </mesh>
        : null
      }
    </group>
  )
});