## WIP Trying to make Effekseer work with R3F


### How to use 
Effects are currently available in the global simulation.effects object.
You can execute them like this:
```js
simulation.playEffect("Laser01");
```

### Debugging
effekseer is currently being initialized inside `SceneContainer.tsx`,
check out the Simulation class and compare it with 
`references/html-demo/src/index.html` 

### Reference
I've included the Effekseer vanilla three demo for reference inside
the reference folder. 
Just run `python -m SimpleHTTPServer` or 
`python3 -m http.server` inside `references/html-demo/src` to view
the original demo in browser.


### Effekseer Resources
* website: https://effekseer.github.io/en/
* effekseer webgl: https://github.com/effekseer/EffekseerForWebGL



