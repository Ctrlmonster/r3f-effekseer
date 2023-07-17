# Effekseer for React-Three-Fiber 🎆💥

React bindings for the **WebGL + WASM** runtime
of [**Effekseer**](https://effekseer.github.io/en/) - a mature **VFX creation tool**
---------

### TODO: Section on how to install

---------

## Adding Effects to your Scene: `<Effect />`
Effects are loaded from `.etf` files, which is the effects 
format of Effekseer. You can export these yourself from the 
Effekseer Editor, or download some from the collection of
[sample effects](https://effekseer.github.io/en/contribute.html).

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
          <Effect ref={effectRef}
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
-------------

## Controlling Effects imperatively via `EffectInstance`

The `<Effect />` component forwards a ref to an `EffectInstance`. This class gives you a persistent handle
to a particular instance of this effect. You can have as many instances
of one effect as you like. The `EffectInstance` provides you  with an
imperative api that lets you set a variety of settings supported
by Effekseer, as well as control playback of the effect. 

Some examples methods:
```js
const effect = new EffectInstance(name, path); // or get via <Effect ref={effectRef}> 
effect.play(); // start a new run of this effect  
effect.setPaused(true); // pause / unpause this effect
effect.stop(); // stop the effect from running
effect.sendTrigger(index); // send trigger to effect (effekseer feature)
```


## Effect Settings
All settings applied to an `EffectInstance` are **persistent** and will be applied to the current
run of this effect, as well as all future calls of `effect.play()`.
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
You can also set settings via **props** on the `<Effect/>` component. 
This is full list of props available:

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
-------------

## The Parent Component: `<Effekseer>`

The `<Effekseer>` parent component provides its children with the React context to spawn effects.
You can access all loaded effects, as well as the manager singleton via the context.
```ts
const {effects, manager} = useContext(EffekseerReactContext);
```

The `<Effekseer>` component can be initialized with a set of native Effekseer settings, 
a custom camera as well as prop to take over Rendering:
```ts
type EffekseerSettings = {
  instanceMaxCount?: number // default is 4000
  squareMaxCount?: number, // default is 10000
  enableExtensionsByDefault?: boolean, 
  enablePremultipliedAlpha?: boolean,
  enableTimerQuery?: boolean,
  onTimerQueryReport?: (averageDrawTime: number) => void,
  timerQueryReportIntervalCount?: number,
}
```

```tsx
<Effekseer settings={effekseerSettings} camera={DefaultCamera} ejectRenderer={false} />
```
--------
## Loading & Rendering Effects: `effekseerManager`  

The parent component also forwards a ref to the `effekseerManager` **singleton**.
This object holds all loaded effects, handles the initialization of the wasm runtime, 
loading/unloading of effects and offers a limited imperative API to play effects, 
next to the `EffectInstance` class.
```
const effectHandle = effectManager.playEffect(name); // play an effect
effectHandle.setSpeed(0.5); // fleeting effect handle, becomes invalid once effect has finished.
// view all loaded effects
console.log(effectManager.effects) 
```

### Overtaking the renderer:
If you decide to eject the default effekseer renderer, you can render yourself like this (it's
what `<Effekseer>` does internally):
```js
useFrame((state, delta) => {
  state.gl.render();
  effekseerManager.render(delta);
}, 1); 
```
**Note**: Setting `ejectRenderer` to true will also be required if
you plan on rendering effekseer effects as a postprocessing effect.
-----------------
## Preloading Runtime & Effects
You can start preloading via the manager. Preloading the runtime means it will already
be available when `<Effekseer>` mounts and preloading effects means they will already
be available when a `<Effect>` component using this effect mounts.<br/>
```js
effekseerManager.preload(); // Start initializing the wasm runtime before <Effekseer> mounts
```

**Note**: Effects can't actually start preloading before the `<Effekseer>` component mounts
This is because they rely on the `EffekseerContext` to be created, which can't be instantiated
before WebGLRenderer, Camera and Scene exist. This is still useful to preload Effects
that don't get mounted with your initial render. Also preloading any effect will
automatically preload the runtime, meaning you don't have to call `preload`, if you're
doing `preloadEffect`.

```js
effekseerManager.preloadEffect(name, path); // will preload runtime automatically
```
---------------

## Disable automatic Effect disposal:
By default, an effect will be disposed when the last `<Effect>` using it unmounts. This means 
the next time an <Effect> component using that effect mounts, it will have to be loaded again. 
You can disable this behaviour via setting the **dispose** prop to null. This way effects
never get disposed automatically. 
```jsx
// Laser1.efk will not be unloaded
<Effect name={"Laser"} path={"../assets/Laser1.efk"} dispose={null}>
```
You can unload the effect yourself via the `effekseerManager`. <br/>
**Note**: Since effects are stored by name, make sure to give each effect a **unique name**.
```js
effekseerManager.disposeEffect("Laser");
```


---------------

## Native API: `EffekseerContext`:
The `EffekseerManager` holds a reference to the `EffekseerContext` which
is a class provided by Effekseer itself. If you are looking for **direct
access** to the **native API**, this is the place to look at. It includes methods like:
```js
effekseerManager.context.setProjectionMatrix();
effekseerManager.context.setProjectionOrthographic();
effekseerManager.context.loadEffectPackage();
...
```

-------------------
## Known issues / Gotchas:
* There needs to be a background color assigned to the scene, or else 
black parts of the particle image are not rendered transparently.

## TODOs:
* Check if all Effekseer Settings are being used in the effekseer.js 
file, in the same that they were used in effekseer.src.js
* add effectInstance.play() promise
* Check if baseDir in manager needs to be settable

## Next Steps / How to Contribute:
* The Effekseer render pass needs to be adapted to be compatible
with the pmndrs PostProcessing lib (see Resources below) - check if 
it could just include effekseerManger.render()
* Check what kind of additional methods to add to the Manager
* Check if HMR experience can be improved

--------------
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


