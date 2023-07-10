## WIP Trying to make Effekseer work with R3F


### How to use 
```
npm install
npm start
```
Effects are currently available in the global `simulation.effects` object
(available in the console). You can execute effects like this:
```js
simulation.playEffect("Laser01");
```

### Known issues:
There needs to be a background color assigned to the scene, or else 
black color in the particle images are not rendered transparently.

### Next Step:
The Effekseer render pass needs to be adapted to be compatible
with the pmndrs PostProcessing lib (see Resources below)

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


