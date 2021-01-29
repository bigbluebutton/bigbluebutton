# React BabylonJS
> *'react-babylonjs'* integrates the BabylonJS real time 3D engine with React

`react-babylonjs` lets you build your scene and components using a familiar declarative structure with the benefits you are used to like reusable components and hooks.  Under the hood it's a React renderer providing declarative bindings for the Fiber `react-reconciler`.  Babylon's API is mostly covered thanks to code generation, but also custom props allow you to declaratively add shadows, physics, attach 2D/3D UI to meshes, etc.

You can also build your own custom 3D controls with functional components. Context API provides access to Scene/Engine/Canvas without prop drilling.  Last but not least, you can use hooks for stateless components!

[![NPM version](http://img.shields.io/npm/v/react-babylonjs.svg?style=flat-square)](https://www.npmjs.com/package/react-babylonjs)
[![NPM downloads](http://img.shields.io/npm/dm/react-babylonjs.svg?style=flat-square)](https://www.npmjs.com/package/react-babylonjs)

## How to Install
```sh
$ cd <your-project-dir>
$ npm i react-babylonjs
```
OR
```sh
$ cd <your-project-dir>
$ yarn add react-babylonjs
```

`react-babylonjs` *v2+* relies on the **ES6** `@babylonjs/*` NPMs.  If you are want to use the `babylonjs` NPM then use the last *v1.x* of `react-babylonjs` (ie: yarn add react-babylonjs@1.0.3).

# Usage Styles
`react-babylonjs` tries to remain unopinionated about how you integrate BabylonJS with React.  This module provides a 100% declarative option and/or you can customise by adding code.

## 100% Declarative add BabylonJS to your project with **zero** code!
With declarative (TSX/JSX) coding and HMR, you experience the same development workflow - ie: save changes in your editor and see them immediately in the browser.  Note in this capture when the light is dimmed that the state changes persist even **after** HMR updates

![BabylonJS HMR](https://raw.githubusercontent.com/brianzinn/react-babylonjs/master/media/react-babylonjs-hmr.gif)

# @babylonjs/core API Support
1. **Node -> Mesh** - abstractMesh, groundMesh, instancedLinesMesh, instancedMesh, linesMesh, mesh, node, transformNode, trailMesh

2. **Cameras** - anaglyphArcRotateCamera, anaglyphFreeCamera, anaglyphGamepadCamera, anaglyphUniversalCamera, arcFollowCamera, arcRotateCamera, camera, deviceOrientationCamera, flyCamera, followCamera, freeCamera, gamepadCamera, stereoscopicArcRotateCamera, stereoscopicFreeCamera, stereoscopicGamepadCamera, stereoscopicUniversalCamera, targetCamera, touchCamera, universalCamera, virtualJoysticksCamera, vrDeviceOrientationArcRotateCamera, vrDeviceOrientationFreeCamera, vrDeviceOrientationGamepadCamera, webVrFreeCamera, webXrCamera

3. **Geometries (meshes)** - box, cylinder, dashedLines, decal, disc, extrudePolygon, extrudeShape, extrudeShapeCustom, ground, groundFromHeightMap, icoSphere, lathe, lines, lineSystem, plane, babylon-polygon/Polygon, polyhedron, ribbon, sphere, tiledBox, tiledGround, tiledPlane, torus, torusKnot, tube
> note: `babylon-polygon` instead of `polygon` due to JSX conflict with `React.SVGProps<SVGPolygonElement>`

4. **Materials** - backgroundMaterial, fluentMaterial, material, multiMaterial, nodeMaterial, pbrBaseMaterial, pbrBaseSimpleMaterial, pbrMaterial, pbrMetallicRoughnessMaterial, pbrSpecularGlossinessMaterial, pushMaterial, shaderMaterial, standardMaterial

5. **Lights** - directionalLight, hemisphericLight, light, pointLight, shadowLight, spotLight

6. **Textures** - advancedDynamicTexture, baseTexture, colorGradingTexture, cubeTexture, customProceduralTexture, dynamicTexture, equiRectangularCubeTexture, hdrCubeTexture, htmlElementTexture, mirrorTexture, multiRenderTarget, multiviewRenderTarget, noiseProceduralTexture, proceduralTexture, rawCubeTexture, rawTexture, rawTexture2DArray, rawTexture3D, refractionTexture, renderTargetTexture, texture, videoTexture

7. **EffectLayers** - effectLayer, glowLayer, highlightLayer

8. **Behaviors** - autoRotationBehavior, bouncingBehavior, framingBehavior, attachToBoxBehavior, fadeInOutBehavior, multiPointerScaleBehavior, pointerDragBehavior, sixDofDragBehavior

9. **Others** - environmentHelper, physicsImpostor, shadowGenerator, cascadedShadowGenerator, vrExperienceHelper

## @babylonjs/gui
1. GUI3DManager
2. **2D Controls** - scrollViewerWindow, baseSlider, babylon-button/Button, checkbox, colorPicker, container, control, displayGrid, babylon-ellipse/Ellipse, grid, babylon-image/Image, imageBasedSlider, imageScrollBar, inputPassword, inputText, babylon-line/Line, multiLine, radioButton, rectangle, scrollBar, scrollViewer, selectionPanel, slider, stackPanel, textBlock, virtualKeyboard
> note: 'babylon-*' for `button`, `ellipse`, `image` & `line` due to JSX conflict with `React.SVGProps<T>`, otherwise use the ProperCase equavalent, but you miss editor auto-completion.

3. **3D Controls** -  abstractButton3D, button3D, container3D, control3D, cylinderPanel, holographicButton, meshButton3D, planePanel, scatterPanel, spherePanel, stackPanel3D, volumeBasedPanel

## Extensions (new in 2.0)
1. dynamicTerrain

# Examples
live demo: [default playground declarative](https://brianzinn.github.io/react-babylonjs/?path=/story/babylon-basic--default-playground)

```jsx
import { Engine, Scene } from 'react-babylonjs'
import { Vector3 } from '@babylonjs/core';

const DefaultPlayground = () => (
  <Engine canvasId="sample-canvas">
    <Scene>
      <freeCamera name="camera1" position={new Vector3(0, 5, -10)} target={Vector3.Zero()} />
      <hemisphericLight name="light1" intensity={0.7} direction={Vector3.Up()} />
      <sphere name="sphere1" diameter={2} segments={16} position={new Vector3(0, 1, 0)} />
      <ground name="ground1" width={6} height={6} subdivisions={2}  />
    </Scene>
  </Engine>
)

export default DefaultPlayground
```
## 100% declarative with state/props flow.  Code to manage props (or state).
You can easily control BabylonJS properties with state or (redux) props.  This sample uses state to control the light intensity and direction of rotation.
live demo: [with props](https://brianzinn.github.io/create-react-app-babylonjs/withProps)
```jsx
class WithProps extends React.Component 
{
  ...
  render() {
    return (
      <Engine canvasId="sample-canvas">
        <Scene>
          <freeCamera name="camera1" position={new Vector3(0, 5, -10)} target={Vector3.Zero()} />
          <hemisphericLight name="light1" intensity={this.state.intensity} direction={Vector3.Up()} />
          <box name="box" size={4} position={new Vector3(0, 1, 0)}>
            <RotateMeshBehavior radians={this.state.clockwiseChecked ? 0.01 : -0.01} axis={Axis.Y} />
          </box>
        </Scene>
      </Engine>
    )
  }
}
```
## 100% declarative VR, 3D models and shadows
OK, optional code needed for rotating model via interactions!

live demo: [VR + 3D model](https://brianzinn.github.io/react-babylonjs/?path=/story/with-vr--simple-vr)

[inspiration playground](https://playground.babylonjs.com/#TAFSN0#2)

Click on the IcoSpheres to rotate the Ghetto Blaster different directions.  You can also use prop flow direct to components if you update state externally.

The **&lt;vrExperienceHelper /&gt;** tag adds button to view in VR headsets!
```jsx
const WithVR = (props) => (
  <Engine canvasId="sample-canvas">
    <Scene onMeshPicked={this.onMeshPicked}>
      <arcRotateCamera name="arc" target={new Vector3(0, 1, 0)} minZ={0.001}
        alpha={-Math.PI / 2} beta={(0.5 + (Math.PI / 4))} radius={2} />

      <directionalLight name="dl" direction={new Vector3(0, -0.5, 0.5)} position={new Vector3(0, 2, 0.5)}>
        <shadowGenerator mapSize={1024} useBlurExponentialShadowMap={true} blurKernel={32}
          shadowCasters={"counterClockwise", "clockwise", "BoomBox"]} />
      </directionalLight>

      <icoSphere name="counterClockwise" position={new Vector3(-0.5, 1, 0)} radius={0.2} flat={true} subdivisions={1}>
        <standardMaterial diffuseColor={Color3.Yellow()} specularColor={Color3.Black()} />
        <RotateMeshBehavior radians={0.01} axis={Axis.Y} />
      </icoSphere>
      <Model
        rotation={new Vector3(0, this.state.modelRotationY, 0)} position={new Vector3(0, 1, 0)}
        rootUrl={`${baseUrl}BoomBox/glTF/`} sceneFilename="BoomBox.gltf"
        scaling={new Vector3(20, 20, 20)}
      />
      ...
      <vrExperienceHelper createDeviceOrientationCamera={false} teleportEnvironmentGround={true} />
      <environmentHelper enableGroundShadow= {true} groundYBias={1}} />
    </Scene>
  </Engine>
)
```

## 2D/3D UI
Write declaratively your UI structure.  You can dynamically add/remove in React, but use key property if you do.  Here in GUI is where declarative excels over imperative :) `react-babylonjs` takes care of addControl()/removeControl() and order of 3D GUI operations (with manager) and updating based on props/state.

Full example: [2D UI to Plane](https://brianzinn.github.io/react-babylonjs/?path=/story/gui--with-2-dui)
```jsx
<plane>
  <advancedDynamicTexture createForParentMesh={true}>
    <rectangle height="60%" thickness={2} color="#EEEEEE">
      <stackPanel>
        <textBlock  text={`You have clicked on '${this.state.clickedMeshName}' ...`} />
        {this.state.allowedMeshes.map(allowedMesh => (
          <textBlock  key={...} text={'• ' + allowedMesh} color="black" fontSize={28} height="20%" />
        ))}
      </stackPanel>
    </rectangle>
  </advancedDynamicTexture>
</plane>
```

## Setting up a React component in your project using onSceneMount().
This is a more advanced and still a typical scanario and allows more control and access to full API of BabylonJS.  You will need to call engine.runRenderLoop(() => {...}).  I will include an example later using the new createCamera() method that makes this even easier (auto attach to canvas) and also creates a typical runRenderLoop() on the engine for you.

```tsx
// If you import Scene from 'babylonjs' then make sure to alias one of them.
import React, { Component } from 'react'
import { Scene } from 'react-babylonjs'

function meshPicked(mesh) {
  console.log('mesh picked:', mesh)
}

function onSceneMount(e) {
  const { canvas, scene } = e

  // Scene to build your environment, Canvas to attach your camera to...
  var camera = new ArcRotateCamera("Camera", 0, 1.05, 6, Vector3.Zero(), scene)
  camera.attachControl(canvas)

  // setup your scene here
  MeshBuilder.CreateBox('box', { size: 3}, scene)
  new HemisphericLight('light', Vector3.Up(), scene);
  
  // in your own render loop, you can add updates to ECS libraries or other tricks.
  scene.getEngine().runRenderLoop(() => {
      if (scene) {
          scene.render();
      }
  });
}

function NonDeclarative() {
  return (
    <Engine canvasId="sample-canvas">
      <Scene onMeshPicked={meshPicked} onSceneMount={onSceneMount} />
    </Engine>
  );
}
```

## Hooks, Shadows and Physics (and optionally TypeScript, too)
You can declaratively use many features together - here only the button click handler actually has any code - and we have declarative Physics, GUI, Lighting and Shadows.  demo: [Bouncy demo](https://brianzinn.github.io/react-babylonjs/?path=/story/physics-and-hooks--bouncy-playground-story)
```jsx
import React, { useCallback } from 'react';
/// full code at https://github.com/brianzinn/create-react-app-typescript-babylonjs

const onButtonClicked = () => {
  if (sphere !== null) {
    sphere.physicsImpostor!.applyImpulse(
      Vector3.Up().scale(10), sphere.getAbsolutePosition()
    )
  }
}

const App: React.FC = () => {
  const sphereRef = useCallback(node => {
    sphere = node.hostInstance;
  }, []);

  return (
    <Engine antialias={true} adaptToDeviceRatio={true} canvasId="sample-canvas">
      <Scene enablePhysics={[gravityVector, new CannonJSPlugin()]}>
        <arcRotateCamera name="arc" target={ new Vector3(0, 1, 0) }
          alpha={-Math.PI / 2} beta={(0.5 + (Math.PI / 4))}
          radius={4} minZ={0.001} wheelPrecision={50} 
          lowerRadiusLimit={8} upperRadiusLimit={20} upperBetaLimit={Math.PI / 2}
        />
        <hemisphericLight name='hemi' direction={new Vector3(0, -1, 0)} intensity={0.8} />
        <directionalLight name="shadow-light" setDirectionToTarget={[Vector3.Zero()]} direction={Vector3.Zero()} position = {new Vector3(-40, 30, -40)}
          intensity={0.4} shadowMinZ={1} shadowMaxZ={2500}>
          <shadowGenerator mapSize={1024} useBlurExponentialShadowMap={true} blurKernel={32}
            shadowCasters={["sphere1", "dialog"]} forceBackFacesOnly={true} depthScale={100}
          />
        </directionalLight>
        <sphere ref={sphereRef} name="sphere1" diameter={2} segments={16} position={new Vector3(0, 2.5, 0)}>
          <physicsImpostor type={PhysicsImpostor.SphereImpostor} _options={{
              mass: 1,
              restitution: 0.9
          }} />
          <plane name="dialog" size={2} position={new Vector3(0, 1.5, 0)}>
            <advancedDynamicTexture name="dialogTexture" height={1024} width={1024} createForParentMesh={true} hasAlpha={true}>
              <rectangle name="rect-1" height={0.5} width={1} thickness={12} cornerRadius={12}>
                  <rectangle>
                    <babylon-button name="close-icon" background="green" onPointerDownObservable={onButtonClicked} >
                      <textBlock text={'\uf00d click me'} fontFamily="FontAwesome" fontStyle="bold" fontSize={200} color="white" />
                    </babylon-button>
                  </rectangle>
              </rectangle>
            </advancedDynamicTexture>
          </plane>
        </sphere>
        
        <ground name="ground1" width={10} height={10} subdivisions={2} receiveShadows={true}>
          <physicsImpostor type={PhysicsImpostor.BoxImpostor} _options={{
              mass: 0,
              restitution: 0.9
          }} />
        </ground>
        <vrExperienceHelper webVROptions={{ createDeviceOrientationCamera: false }} enableInteractions={true} />
      </Scene>
    </Engine>
  );
}
```

## Major Release History
> v1.0.0 (2018-11-29) - Add code generation, HoC, context provider

> v2.0.1 (2019-10-09) - Switch to @babylonjs/* NPM. Add intrinsic elements, physics and dynamic terrain.

> v2.1.0 (2020-03-21) - NPM distro reduced size has only module.  Add [behaviors](https://brianzinn.github.io/react-babylonjs/?path=/story/behaviors--drag-n-drop), effects (ie: [glow](https://brianzinn.github.io/react-babylonjs/?path=/story/special-fx--glow-layer)), CustomProps (ie: [chroma.js](https://brianzinn.github.io/react-babylonjs/?path=/story/integrations--chroma-js-props)).

> v2.2.0 (2020-04-04) - Added support for `react-spring` [demo](https://brianzinn.github.io/react-babylonjs/?path=/story/integrations--react-spring)

## Breaking Changes
 > 0.x to 1.0 ([List](breaking-changes-0.x-to-1.0.md))
 
 > 1.x to 2.0 -  Change NPMs from `babylonjs-*` to `@babylonjs/*`.  'Engine' not passed into onSceneMount(e) parameter - use e.scene.getEngine().  Suggest switching to intrinsic elements (camelCase instead of ProperCase).

### Example Projects
* The storybook pages for this project have the source code embedded in the page.
* [Create React App (JavaScript)](https://github.com/brianzinn/create-react-app-babylonjs) CRA JavaScript implementation.  GH Pages has examples of typical and declarative usage some with Redux.
* [Create React App (TypeScript)](https://github.com/brianzinn/create-react-app-typescript-babylonjs) CRA 3 TypeScript.

---
## Contributors
Huge shout out to [Konsumer](https://github.com/konsumer) that brought this project to the next level. The ideas and code sandboxes from issue #6 inspired the code generation and HOC + Context API integration.

Thanks to [seacloud9](https://github.com/seacloud9) for adding storybook (and [GSAP demo](https://brianzinn.github.io/react-babylonjs/?path=/story/integrations--gsap-timeline)).  Also for adding [dynamic terrain](https://brianzinn.github.io/react-babylonjs/?path=/story/babylon-basic--dynamic-terrain).  Ported a branch of his into a [PIXI demo](https://brianzinn.github.io/react-babylonjs/?path=/story/integrations--pixi-story).

Lots of contributions from [hookex](https://github.com/hookex) :)  Proper texture handling [demo](https://brianzinn.github.io/react-babylonjs/?path=/story/textures--image-texture), Node parenting [demo](https://brianzinn.github.io/react-babylonjs/?path=/story/babylon-basic--transform-node) Full Screen GUI [demo](https://brianzinn.github.io/react-babylonjs/?path=/story/gui--gui-full-screen), Effect Layers [glow demo](https://brianzinn.github.io/react-babylonjs/?path=/story/special-fx--glow-layer), behaviors [demo](https://brianzinn.github.io/react-babylonjs/?path=/story/behaviors--pointer-drag-behavior), useHover & useClick [demo](https://brianzinn.github.io/react-babylonjs/?path=/story/hooks--use-hover-event) and react-spring integration [demo](https://brianzinn.github.io/react-babylonjs/?path=/story/integrations--react-spring).

[dennemark](https://github.com/dennemark) added Cascaded  Shadow Generator

Made with ♥ by Brian Zinn
