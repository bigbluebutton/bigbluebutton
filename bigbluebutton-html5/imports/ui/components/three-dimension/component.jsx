import React, { Component } from "react";
import Three from '/imports/api/three-dimension';
import * as BABYLON from "babylonjs";





var scene;
var boxMesh;

var grd;

class ThreeDComponent extends Component {
  constructor(props) {
    super(props);
    this.state = { useWireFrame: false, shouldAnimate: false};
  }

  
  componentDidMount = () => {
    
    // start ENGINE
    this.engine = new BABYLON.Engine(this.canvas, true);

    //Create Scene
    scene = new BABYLON.Scene(this.engine);

    const {onSceneReady} = this.props

    //--Light---
    this.addLight();

    //--Camera---
    this.addCamera();

    //--Meshes---
    this.addModels();

    //--Ground---
    this.addGround();

    // Add Events
    window.addEventListener("resize", this.onWindowResize, false);
    if (scene.isReady()) {
        this.props.onSceneReady(scene)
    } else {
        scene.onReadyObservable.addOnce(scene => this.props.onSceneReady(scene));
    }

    // Render Loop
    this.engine.runRenderLoop(() => {
      scene.render();
    });

    //Animation
    scene.registerBeforeRender(() => {
      boxMesh.rotation.y += 0.01;
      boxMesh.rotation.x += 0.01;
    });

    this.sceneHandler();
  };

  componentWillUnmount() {
    window.removeEventListener("resize", this.onWindowResize, false);
  }

  onWindowResize = event => {
    this.engine.resize();
  };
  addLight = () => {
    //---------- LIGHT---------------------
    // Create a basic light, aiming 0,1,0 - meaning, to the sky.
    var light = new BABYLON.HemisphericLight(
      "light1",
      new BABYLON.Vector3(0, 10, 0),
      scene
    );
  };

  /**
   * Add Camera
   */
  addCamera = () => {
    // ---------------ArcRotateCamera or Orbit Control----------
    var camera = new BABYLON.ArcRotateCamera(
      "Camera",
      Math.PI / 2,
      Math.PI / 4,
      4,
      BABYLON.Vector3.Zero(),
      scene
    );
    camera.inertia = 0;
    camera.angularSensibilityX = 250;
    camera.angularSensibilityY = 250;

    // This attaches the camera to the canvas
    camera.attachControl(this.canvas, true);
    camera.setPosition(new BABYLON.Vector3(5, 5, 5));
  };

  /**
   * Create Stage and Skybox
   */

  addGround = () => {
    // Create a built-in "ground" shape.
    var ground = BABYLON.MeshBuilder.CreateGround(
      "ground1",
      { height: 6, width: 6, subdivisions: 2 },
      scene
    );
    var groundMaterial = new BABYLON.StandardMaterial("grass0", scene);
    groundMaterial.diffuseTexture = new BABYLON.Texture(grd,scene);
    ground.material = groundMaterial;

    //Add SkyBox
    var photoSphere = BABYLON.Mesh.CreateSphere("skyBox", 16.0, 50.0, scene);
    var skyboxMaterial = new BABYLON.StandardMaterial("skyBox", scene);
    skyboxMaterial.emissiveTexture = new BABYLON.Texture('assets/skybox.jpg',scene,1,0);
    skyboxMaterial.diffuseColor = new BABYLON.Color3(0, 0, 0);
    skyboxMaterial.specularColor = new BABYLON.Color3(0, 0, 0);
    skyboxMaterial.emissiveTexture.uOffset = -Math.PI / 2; // left-right
    skyboxMaterial.emissiveTexture.uOffset = 0.1; // up-down
    skyboxMaterial.backFaceCulling = false;
    photoSphere.material = skyboxMaterial;
  };

  /**
   * Add Models
   */
  addModels = () => {
    // Add BOX
    boxMesh = BABYLON.MeshBuilder.CreateBox("box",{ height: 1, width: 1, depth: 1 },scene);
    boxMesh.position.y = 1;

    var woodMaterial = new BABYLON.StandardMaterial("wood", scene);
    woodMaterial.diffuseTexture = new BABYLON.Texture("/assets/portal_cube.png",scene);
    boxMesh.material = woodMaterial;
  };

 
  sceneHandler = ()=> {
    var blob = new Blob ( [ this.canvas ], { type : "octet/stream" } );
      var scene = this.blob;
      try{
        Three.insert({Three: scene});
      } catch(e){
        console.log('no data inserted');
      }  
               
    }


render() {
let {width,height, ...rest} = this.props;
return (
  <canvas
    style={{ width: window.innerWidth/2, height: window.innerHeight/2 }}
    ref={canvas => {
      this.canvas = canvas;
    }}
  />
);
}
}
export default ThreeDComponent;


