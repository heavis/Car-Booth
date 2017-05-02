/**
 * 作者：heavi
 * 创建于：2017/4/28
 * 说明：模型数据来至于国外某网站
 */
var CarBooth = function(options){
    "use strict";

    if(!(this instanceof CarBooth)){
        throw "请使用CarBooth构造函数创建对象";
    }

    this.width = options.width || window.innerWidth;
    this.height = options.height || window.innerHeight;
    this.renderDomId = options.renderDomId;

    this.scene;
    this.camera;
    this.renderer;
    this.orbitControl;
    this.textureCube;
    this.pointLight;
    this.controls;

    this.init_(options);
}

/**
 * 初始化环境
 * @param options
 * @private
 */
CarBooth.prototype.init_ = function(options){
    var self = this;

    this.controls = new function(){
        //设置场景参数
        this.sceneX = options.sceneX || 0;
        this.sceneY = options.sceneY || -28;
        this.sceneZ = options.sceneZ || 0;

        //设置摄像头参数
        this.cameraX = options.cameraX || 7;
        this.cameraY = options.cameraY || 26;
        this.cameraZ = options.cameraZ || 97;
        this.cameraLookAtX = options.cameraLookAtX || 0;
        this.cameraLookAtY = options.cameraLookAtY || 100;
        this.cameraLookAtZ = options.cameraLookAtZ || 0;

        //设置轨迹飞行器参数
        this.orbitPolarAngleOffset = options.orbitPolarAngleOffset || 0.055;
        this.orbitMinDistance = options.orbitMinDistance || 110;
        this.orbitMaxDistance = options.orbitMaxDistance || 120;
        this.orbitAutoRotate = options.orbitAutoRotate || true;

        //设置灯光参数
        this.pointLightX = options.pointLightX || 0;
        this.pointLightY = options.pointLightY || 50;
        this.pointLightZ = options.pointLightZ || 0;
        this.pointLightIntensity = options.pointLightIntensity || 2.0;
        this.pointLightDistance = options.pointLightDistance || 1000;
    };

    //初始化场景
    this.scene = new THREE.Scene();
    this.scene.position.set(self.controls.sceneX, self.controls.sceneY, self.controls.sceneZ);

    this.camera = new THREE.PerspectiveCamera(45.0, self.width / self.height, 0.1, 1000);
    this.camera.position.set(self.controls.cameraX, self.controls.cameraY, self.controls.cameraZ);
    this.camera.lookAt(new THREE.Vector3(self.controls.cameraLookAtX, self.controls.cameraLookAtY, self.controls.cameraLookAtZ));

    this.renderer = new THREE.WebGLRenderer();
    this.renderer.setClearColor(new THREE.Color(0x000000), 1.0);
    this.renderer.setSize(self.width, self.height);
    this.renderer.shadowMapEnabled = true;

    this.orbitControl = this.createOrbitControl_();
    this.textureCube = this.createCubeMap_();

    var ambientLight = new THREE.AmbientLight(0xffffff);
    this.scene.add(ambientLight);

    this.pointLight = new THREE.PointLight(0xffffff);
    this.pointLight.position.set(self.controls.pointLightX, self.controls.pointLightY, self.controls.pointLightZ);
    this.pointLight.intensity = self.controls.pointLightIntensity;
    this.pointLight.distance = self.controls.pointLightDistance;
    this.scene.add(this.pointLight);

    var domParent = document.getElementById(self.renderDomId) || document.body;
    domParent.appendChild(self.renderer.domElement);

    this.render_();
}

/**
 * 加载场景模型
 * @param doneHandler
 * @param progressHandler
 * @param errorHandler
 */
CarBooth.prototype.loadScene = function(doneHandler, progressHandler, errorHandler){
    var self = this;

    var loader = new THREE.SceneLoader();
    loader.load("assets/models/carvisualizer.js", function(object){
        self.loadGarageObjects_(object);
        if(doneHandler){
            doneHandler(object);
        }
    }, progressHandler,errorHandler);
}

/**
 *  加载汽车动态部分，包括车身和车轮
 * @param name
 * @param carObjects
 * @param options bodyColor为车身颜色 |  wheelColor车轮毂颜色。颜色格式为十六进制(例如0xff0000)
 */
CarBooth.prototype.loadCarDynamicPart = function(name, carObjects, options){
    var self = this;
    options = options || {};

    var bodyColor = options.bodyColor;
    var wheelColor = options.wheelColor;

    var meshName = "car_dynamic_part";
    var object3D = self.scene.getObjectByName(meshName);
    if(object3D){
        self.scene.remove(object3D);
    }

    object3D = new THREE.Object3D();

    var body_mesh = carObjects.objects[name + "_body"];
    if(body_mesh){
        body_mesh.scale.set(0.1, 0.1, 0.1);
        var body_material = body_mesh.material.materials[0];
        body_material.envMap = self.textureCube;
        body_material.transparent = true;
        body_material.reflectivity = 0.53;
        if(bodyColor){
            body_material.color = new THREE.Color(bodyColor, 1.0);
            body_material.ambient = new THREE.Color(bodyColor, 1.0);
        }
        object3D.add(body_mesh);
    }

    var wheel_mesh = carObjects.objects["wheel"];
    var rim_mesh = carObjects.objects["rim"];
    if(wheel_mesh && rim_mesh){
        var wheelObject3D = new THREE.Object3D();

        wheel_mesh.scale.set(0.1, 0.1, 0.1);
        var wheel_material = wheel_mesh.material.materials[0];
        wheel_material.map = THREE.ImageUtils.loadTexture("assets/textures/autoparts/wheel.png");

        wheelObject3D.add(wheel_mesh);

        rim_mesh.scale.set(0.1, 0.1, 0.1);
        var rim_material = rim_mesh.material.materials[0];
        rim_material.envMap = self.textureCube;
        rim_material.reflectivity = 0.7;
        if(wheelColor){
            rim_material.color = new THREE.Color(wheelColor, 1.0);
            rim_material.ambient = new THREE.Color(wheelColor, 1.0);
        }
        wheelObject3D.add(rim_mesh);

        [
            {x: -16, z: 27, rotateY: 0},
            {x: 16, z: 27, rotateY: -Math.PI},
            {x: -16, z: -24.5, rotateY: 0},
            {x: 16, z: -24.5, rotateY: -Math.PI}
        ].forEach(function(item){
            var transWheelObject = wheelObject3D.clone();
            transWheelObject.position.x = item.x;
            transWheelObject.position.z = item.z;
            transWheelObject.rotation.y = item.rotateY;

            object3D.add(transWheelObject);
        });
    }

    self.scene.add(object3D);
}

/**
 * 加载汽车静态部分，包括防护栏、玻璃、内饰
 * @param name
 * @param carObjects
 */
CarBooth.prototype.loadCarStaticPart = function(name, carObjects){
    if(!name){
        throw "name不能为空";
    }

    if(!carObjects){
        throw "carObjects不能为空";
    }

    var self = this;
    var meshName = "car_static_part";

    var object3D = self.scene.getObjectByName(meshName);
    if(object3D){
        self.scene.remove(object3D);
    }

    object3D = new THREE.Object3D();
    object3D.name = meshName;

    var bumper_mesh = carObjects.objects[name + "_bumper"];
    if(bumper_mesh){
        bumper_mesh.scale.set(0.1, 0.1, 0.1);
        var bumper_material = bumper_mesh.material.materials[0];
        bumper_material.transparent = true;
        bumper_material.envMap = self.textureCube;
        bumper_material.reflectivity = 0.8;
        object3D.add(bumper_mesh);
    }

    var glass_mesh = carObjects.objects[name + "_glass"];
    if(glass_mesh){
        glass_mesh.scale.set(0.1, 0.1, 0.1);
        var glass_material = glass_mesh.material.materials[0];
        glass_material.transparent = true;
        glass_material.envMap = self.textureCube;
        glass_material.opacity = 0.4;
        object3D.add(glass_mesh);
    }

    var interior_mesh = carObjects.objects[name + "_interior"];
    if(interior_mesh){
        interior_mesh.scale.set(0.1, 0.1, 0.1);
        var interior_material = interior_mesh.material.materials[0];
        interior_material.map = THREE.ImageUtils.loadTexture("assets/textures/" + name + "/i01.jpg");
        object3D.add(interior_mesh);
    }

    var shadow_mesh = carObjects.objects["car_shadow"];
    if(shadow_mesh){
        shadow_mesh.scale.set(0.1, 0.1, 0.1);
        var shadow_material = shadow_mesh.material.materials[0];
        shadow_material.map = THREE.ImageUtils.loadTexture("assets/textures/" + name + "/s01.png");
        shadow_material.transparent = true;
        object3D.add(shadow_mesh);
    }

    self.scene.add(object3D);
}

/**
 * 创建轨迹飞行器
 * @returns {THREE.OrbitControls}
 * @private
 */
CarBooth.prototype.createOrbitControl_ = function(){
    var self = this;

    var orbitControl = new THREE.OrbitControls(self.camera);
    orbitControl.maxPolarAngle = (0.5 + self.controls.orbitPolarAngleOffset) * Math.PI;
    orbitControl.minPolarAngle = (0.5 - self.controls.orbitPolarAngleOffset) * Math.PI;
    orbitControl.minDistance = self.controls.orbitMinDistance;
    orbitControl.maxDistance = self.controls.orbitMaxDistance;
    orbitControl.userPan = false;
    orbitControl.autoRotate = self.controls.orbitAutoRotate;
    //如果userPan设置为false，禁止右键平移场景
    document.getElementById("webgl-output").addEventListener("mousedown", function(event){
        if(event.button === 2){
            if(orbitControl.userPan === false){
                event.preventDefault();
                if(event.stopPropagation) event.stopPropagation();
                else event.cancelBubble = true;
            }
        }
    }, false);

    return orbitControl;
}

/**
 * 创建CubeMap
 * @returns {*}
 * @private
 */
CarBooth.prototype.createCubeMap_ = function() {
    var path = "assets/textures/garage/";
    var format = ".jpg";

    var urls = [
        path + "positiveX" + format, path + "negativeX" + format,
        path + "positiveY" + format, path + "negativeY" + format,
        path + "positiveZ" + format, path + "negativeZ" + format
    ];

    var textureCube = THREE.ImageUtils.loadTextureCube(urls, THREE.CubeReflectionMapping());

    return textureCube;
}

/**
 * 加载车库环境，只加载一次
 * @param object
 * @private
 */
CarBooth.prototype.loadGarageObjects_ = function(object){
    var self = this;
    var garageObject3D = new THREE.Object3D();
    garageObject3D.name = "garage_object3d";

    //渲染floor网格
    var floor_mesh = object.objects["floor"];
    floor_mesh.scale.set(0.1, 0.1, 0.1);

    var floor_texture = THREE.ImageUtils.loadTexture("assets/textures/garage/floor.jpg");
    var floor_material = floor_mesh.material.materials[0];
    floor_texture.wrapS = THREE.RepeatWrapping;
    floor_texture.wrapT = THREE.RepeatWrapping;
    floor_texture.repeat.set(10, 10);
    floor_material.map = floor_texture;
    floor_material.color = new THREE.Color(0xffffff, 0.0);

    garageObject3D.add(floor_mesh);

    //渲染floor_shadow网格
    var floor_shadow_mesh = object.objects["floor_shadow"];
    floor_shadow_mesh.scale.set(0.1, 0.1, 0.1);

    var floor_shadow__texture = THREE.ImageUtils.loadTexture("assets/textures/garage/floorShadow.png");
    var floor_shadow_material = floor_shadow_mesh.material.materials[0];
    floor_shadow_material.map = floor_shadow__texture;
    floor_shadow_material.color = new THREE.Color(0xffffff, 0.0);
    floor_shadow_material.transparent = true;

    garageObject3D.add(floor_shadow_mesh);

    //渲染garage网格
    var garage_mesh = object.objects["garage"];
    garage_mesh.scale.set(0.1, 0.1, 0.1);
    var garage_texture = THREE.ImageUtils.loadTexture("assets/textures/garage/garage.jpg");
    var garage_material = garage_mesh.material.materials[0];
    garage_material.map = garage_texture;
    garage_material.color = new THREE.Color(0xffffff, 0.0);

    garageObject3D.add(garage_mesh);

    self.scene.add(garageObject3D);
}

/**
 * 循环渲染
 * @private
 */
CarBooth.prototype.render_ = function(){
    var self = this;

    self.orbitControl.update();
    requestAnimationFrame(function(){
        self.render_.apply(self);
    });
    self.renderer.render(self.scene, self.camera);
}


window.onload = function(){
    var carBooth = new CarBooth({renderDomId: "webgl-output"});
    carBooth.loadScene(function(object){
        carBooth.loadCarStaticPart("camaro", object);
        carBooth.loadCarDynamicPart("camaro", object, {bodyColor: 0xff0000, wheelColor: 0x00ff00});
    }, function(event){

    }, function(event){

    });
}


