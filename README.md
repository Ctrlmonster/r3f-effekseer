# R3F-Effekseer
## Effekseer for React-Three-Fiber

### ⚠️ ONLY NEEDS TO BE PROPERLY PACKAGED INTO A LIB⚠️


This library provides r3f bindings to the **WebGL+WASM** runtime
of **Effekseer**. Effekseer is a mature **VFX creation tool**,
which includes support for many Game Engines and has its own
advanced, free to use **Editor**, that you can use to create you own Effects.
 
## Adding Effects to your Scene:
Effects are loaded from `.etf` files, which is the effects 
format of Effekseer. You can export these yourself from the 
Effekseer Editor [add link here], or download some from the
collection of sample effects [add link here].

```tsx
function MyScene() {
  // get ref to EffectInstance for imperative control of effect
  const effectRef = useRef<EffectInstance>(null!);

  return (
    // effects can be added anywhere inside parent component
    <Effekseer>
      <mesh onClick={() => effectRef.current?.play()}>
        <sphereGeometry/>
        <meshStandardMaterial/>

        {/*Suspense is required for async loading of effect*/}
        <Suspense> 
          <Effekt ref={effectRef}
                  name={"Laser1"}
                  src={"../assets/Laser1.efk"}
                  playOnMount // start playing as soon effect is ready
                  position={[0, 1.5, 0]} // transforms are relative to parent mesh
          />
        </Suspense>
      </mesh>
    </Effekseer>
  )
}
```

### Imperative API

The `<Effect />` component forwards a ref to an instance of the 
`EffectInstance` class. This class gives you a persistent handle
to a particular instance of this effect. You can have as many instances
of one effect as you like. The `EffectInstance` class provides you
with an imperative api that lets you set a variety of settings supported
by Effekseer, as well as control playback of the effect. 

Some examples methods:
```js
const effect = new EffectInstance(name, path); // or get via <Effect> ref
effect.play(); // start a new run of this effect  
effect.setPaused(true); // pause / unpause this effect
effect.stop(); // stop the effect from running
effect.sendTrigger(index); // send trigger to effect (effekseer feature)
```

### Effect Settings
All settings are **persistent** and will be applied to the current
run of this effect, as well as the next time the next time you 
call `effect.play()`.
```js
effect.setSpeed(0.5); // set playback speed
effect.setPosition(x, y, z); // set transforms relative to parent in scene tree
effect.setColor(255, 0, 255, 255); // set rgba color
effect.setVisible(false) // hide effect
```

To **drop a setting**, call `effect.dropSetting(name)`. This is the full 
list of **available settings**:
```ts
type EffectInstanceSetting = "paused"
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
```
You can also set settings via **props**. This is full list of props 
available on the `<Effect/>` component:

```ts
type EffectProps = {
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
  dispose?: null, // set to null to prevent unloading of effect on dismount
  debug?: boolean,
  // -----------------------------------------
  // loading callbacks
  onload?: (() => void) | undefined,
  onerror?: ((reason: string, path: string) => void) | undefined,
  redirect?: ((path: string) => string) | undefined,
} 

```

## The Parent: `<Effekseer>` & EffekseerManager

The `<Effekseer>` parent component provides its children with the React context to spawn effects.
It also forwards a ref to the `EffekseerManager` **singleton**.
This object handles the initialization of the **wasm runtime** and is there
to **load/unload effects**. It als offers a **limited imperative API** to play
effects, next to the `EffectInstance` class.
```js
const effectHandle = effectManager.playEffect(name); // play an effect
effectHandle.setSpeed(0.5); // fleeting effect handle, becomes invalid once effect has finished.
```

### EffekseerContext (native API):
The `EffekseerManager` holds a reference to the `EffekseerContext` which
is a class provided by Effekseer itself. If you are looking for **direct
access** to the **native API**, this is the place to look at. It includes methods like:
```js
effekseerManager.context.setProjectionMatrix();
effekseerManager.context.setProjectionOrthographic();
effekseerManager.context.loadEffectPackage();
...
```


### Pre-loading Runtime / Effects

```js
// Start initializing the wasm runtime before <Effekseer> mounts 
effekseerManager.preload();

// Start loading a specific effect, so it's already available
// when a <Effect> using it mounts. Effects can only start
// loading once WebGLRenderer, Scene and Camera are available.
// Pre-loading any effect will automatically preload the runtime too!
effekseerManager.preloadEffect(name, path);
```


## Known issues / Gotchas:
* There needs to be a background color assigned to the scene, or else 
black color in the particle images are not rendered transparently.

## Next Steps / How to Contribute:
* The Effekseer render pass needs to be adapted to be compatible
with the pmndrs PostProcessing lib (see Resources below)
* Figure out how this could be packaged into a library
* Make effectInstance.play() return a promise for the end of the effect
* Check what kind of methods to add to the Manager

## References
### Vanilla Three.js Demo
I've included the Effekseer vanilla three demo for reference inside
the reference folder. 
Just run `python -m SimpleHTTPServer` or 
`python3 -m http.server` inside `references/html-demo/src` to view
the original demo in browser.

### Effekseer Resources
* website: https://effekseer.github.io/en/
* effekseer webgl: https://github.com/effekseer/EffekseerForWebGL
* effekseer post processing pass: https://github.com/effekseer/EffekseerForWebGL/blob/master/tests/post_processing_threejs.html


