## WIP Trying to make Effekseer work with R3F


### How to use 
Effects are currently available in the global `simulation.effects` object
(available in the console). You can execute effects like this:
```js
simulation.playEffect("Laser01");
```

### Debugging
Right now there is an issue with particle alpha / texture backgrounds. 
Effekseer is currently being initialized inside `SceneContainer.tsx`,
check out the Simulation class and compare it with 
`references/html-demo/src/index.html` to see if you can spot any mistakes.
Otherwise, I'm assuming this is related to r3f / different three version being
used in the vanilla effekseer demo.


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


