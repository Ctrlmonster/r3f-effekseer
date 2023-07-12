## WIP Trying to make Effekseer work with R3F


### How to use 
```
npm install
npm start
```
Effects are currently available in the global `simulation.effects` object
(available in the console). You can execute effects like this:
```js

// create ref to mixer which offers imperative api for spawning new effects
const effectsMixer = useRef<EffectsMixer>(null);
effectsMixer.current.playEffect("Laser01");

// create ref to persistent <Effect>  
const effectRef = useRef<EffectPlayer>(null);

return (
  <Effekseer ref={effectsMixer}>
    {/*Trigger Effect when clicking on Mesh */}
    <mesh onClick={() => effectRef.current?.play()}>
      <sphereGeometry/>
      <meshStandardMaterial color="orange"/>

      {/*Effect's Transforms are relative to parent Mesh*/}
      <Suspense fallback={null}>
        <Effect ref={effectRef}
                name={"Laser01"}
                src={laserUrl}
                dispose={null}
                position={[0, 1, 0]}
                rotation={rotation}
                scale={scale}
                playOnMount // play effect on mount
                debug
        />
      </Suspense>
    </mesh>
  </Effekseer>
)
```

### Known issues:
There needs to be a background color assigned to the scene, or else 
black color in the particle images are not rendered transparently.

### Next Step:
* The Effekseer render pass needs to be adapted to be compatible
with the pmndrs PostProcessing lib (see Resources below)
* Figure out how this could be packaged into a library

### Reference
I've included the Effekseer vanilla three demo for reference inside
the reference folder. 
Just run `python -m SimpleHTTPServer` or 
`python3 -m http.server` inside `references/html-demo/src` to view
the original demo in browser.


### Effekseer Resources
* website: https://effekseer.github.io/en/
* effekseer webgl: https://github.com/effekseer/EffekseerForWebGL
* effekseer post processing pass: https://github.com/effekseer/EffekseerForWebGL/blob/master/tests/post_processing_threejs.html


