# babylonjs-hook

Future plans are to add useful hooks for attaching cameras and a provider for Babylon scene object.  Additionally will be including hooks for loading resources/models that support Suspense.

[![NPM version](http://img.shields.io/npm/v/babylonjs-hook.svg?style=flat-square)](https://www.npmjs.com/package/babylonjs-hook)
[![NPM downloads](http://img.shields.io/npm/dm/babylonjs-hook.svg?style=flat-square)](https://www.npmjs.com/package/babylonjs-hook)

## How to Install
```sh
$ cd <your-project-dir>
$ npm i babylonjs-hook
```
OR
```sh
$ cd <your-project-dir>
$ yarn add babylonjs-hook
```

Basic Usage:
```jsx
import React from 'react';
import { FreeCamera, Vector3, HemisphericLight, MeshBuilder } from '@babylonjs/core';
import SceneComponent from 'babylonjs-hook';
import './App.css';

let box;

const onSceneReady = scene => {
  // This creates and positions a free camera (non-mesh)
  var camera = new FreeCamera("camera1", new Vector3(0, 5, -10), scene);

  // This targets the camera to scene origin
  camera.setTarget(Vector3.Zero());

  const canvas = scene.getEngine().getRenderingCanvas();

  // This attaches the camera to the canvas
  camera.attachControl(canvas, true);

  // This creates a light, aiming 0,1,0 - to the sky (non-mesh)
  var light = new HemisphericLight("light", new Vector3(0, 1, 0), scene);

  // Default intensity is 1. Let's dim the light a small amount
  light.intensity = 0.7;

  // Our built-in 'box' shape.
  box = MeshBuilder.CreateBox("box", {size: 2}, scene);

  // Move the box upward 1/2 its height
  box.position.y = 1;

  // Our built-in 'ground' shape.
  MeshBuilder.CreateGround("ground", {width: 6, height: 6}, scene);
}

/**
 * Will run on every frame render.  We are spinning the box on y-axis.
 */
const onRender = scene => {
  if (box !== undefined) {
    var deltaTimeInMillis = scene.getEngine().getDeltaTime();

    const rpm = 10;
    box.rotation.y += ((rpm / 60) * Math.PI * 2 * (deltaTimeInMillis / 1000));
  }
}

function App() {

  return (
    <div className="App">
      <header className="App-header">
        <SceneComponent antialias onSceneReady={onSceneReady} onRender={onRender} id='my-canvas' />
      </header>
    </div>
  );
}

export default App;
```


