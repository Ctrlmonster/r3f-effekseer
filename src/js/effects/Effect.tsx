import React, {
  ForwardedRef,
  forwardRef,
  useContext,
  useEffect,
  useImperativeHandle,
  useLayoutEffect,
  useRef
} from "react";
import {Group, Vector3} from "three";
import {EffekseerContextProvider, EffekseerReactContext} from "./EffectContext";
import {EffekseerEffect, EffekseerHandle} from "src/js/effects/effekseer/effekseer";
import {useFrame} from "@react-three/fiber";


export type EffectProps = {
  name: string,
  src: string,
  position?: [number, number, number],
  rotation?: [number, number, number],
  scale?: [number, number, number],
  playOnMount?: boolean,
  disposeOnUnmount?: boolean,

  onload?: (() => void) | undefined,
  onerror?: ((reason: string, path: string) => void) | undefined,
  redirect?: ((path: string) => string) | undefined,
}


export const Effect = forwardRef(({
                                    src, name,
                                    position, rotation, scale,
                                    onerror, onload, redirect,
                                    playOnMount, disposeOnUnmount
                                  }: EffectProps, ref: ForwardedRef<EffekseerEffect>) => {

  const group = useRef<Group>(null!);
  const worldPos = useRef(new Vector3());
  const worldScale = useRef(new Vector3());

  const {manager} = useContext(EffekseerReactContext);
  const effectRef = useRef<EffekseerEffect | null>(null);
  const effectHandle = useRef<EffekseerHandle | null>(null);

  // TODO: imperative ref not working yet - likely needs suspense

  useLayoutEffect(() => {
    console.log("in effect ule", name);

    const asyncLoading = async () => {
      // add error for missing context?
      effectRef.current = await manager.loadEffect(name, src, 1, onload, onerror, redirect);

      if (playOnMount) {
        effectHandle.current = manager.playEffect(name);
        // effectHandle.current is null for the first effect - why is that?
        console.log(effectRef.current);
        console.log(effectHandle.current);
      }
    }
    asyncLoading();

    return () => {
      if (disposeOnUnmount) {
        manager.disposeEffect(name);
      }
    }
  }, []);


  useFrame(() => {
    if (effectHandle.current) {
      const pos = group.current.getWorldPosition(worldPos.current);
      effectHandle.current.setLocation(pos.x, pos.y, pos.z);

      const rot = group.current.rotation;
      //const rot = group.current.getWorldDirection(worldPos.current);
      effectHandle.current.setRotation(rot.x, rot.y, rot.z);

      const scale = group.current.getWorldScale(worldScale.current);
      effectHandle.current.setScale(scale.x, scale.y, scale.z);
    }
  });

  return (
    <group ref={group} position={position} rotation={rotation} scale={scale}/>
  )
});