/**
 * 汽车展厅
 * 参考网站：http://carvisualizer.plus360degrees.com/threejs/
 */
var garageMesh;

function init() {
    var scene = new THREE.Scene();
    scene.position.set(0, -28, 0);

    var camera = new THREE.PerspectiveCamera(45.0, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(7, 26, 97);
    camera.lookAt(new THREE.Vector3(0, 100, 0));

    var renderer = new THREE.WebGLRenderer();
    renderer.setClearColor(new THREE.Color(0x000000), 1.0);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMapEnabled = true;

    //orbitcontrol不能使用pan，限制z方向角度，限制distance
    var orbitControl = new THREE.OrbitControls(camera);
    orbitControl.maxPolarAngle = (0.5 + 0.065) * Math.PI;
    orbitControl.minPolarAngle = (0.5 - 0.065) * Math.PI;
    orbitControl.minDistance = 110;
    orbitControl.maxDistance = 120;
    orbitControl.userPan = false;
    orbitControl.autoRotate = true;
    document.getElementById("webgl-output").addEventListener("mousedown", function(event){
        if(event.button === 2){
            if(orbitControl.userPan === false){
                event.preventDefault();
                if(event.stopPropagation) event.stopPropagation();
                else event.cancelBubble = true;
            }
        }
    }, false);

    var textureCube = createCubeMap();
    //var shader = THREE.ShaderLib["cube"];
    //shader.uniforms["tCube"].value = textureCube;

    //设置加载进度
    //THREE.DefaultLoadingManager.onProgress = function(url, itemsLoaded, itemsTotal){
    //    console.log("load " + url + ", finished " + itemsLoaded + ", totals " + itemsTotal);
    //}

    loadCarVisualizer();


    var ambientLight = new THREE.AmbientLight(0xffffff);
    scene.add(ambientLight);

    var dirLight = new THREE.PointLight(0xffffff);
    dirLight.position.set(0, 50, 0);
    dirLight.intensity = 2.0;
    dirLight.distance = 1000;
    scene.add(dirLight);

    document.getElementById("webgl-output").appendChild(renderer.domElement);
    var controls = new function () {
        this.lightX = dirLight.position.x;
        this.lightY = dirLight.position.y;
        this.lightZ = dirLight.position.z;
        this.lightDistance = dirLight.distance;

        this.cameraX = camera.position.x;
        this.cameraY = camera.position.y;
        this.cameraZ = camera.position.z;

        this.cameraLookAtX = scene.position.x;
        this.cameraLookAtY = scene.position.y;
        this.cameraLookAtZ = scene.position.z;

        this.sceneX = scene.position.x;
        this.sceneY = scene.position.y;
        this.sceneZ = scene.position.z;

        this.orbiMinDistance = orbitControl.minDistance;
        this.orbiMaxDistance = orbitControl.maxDistance;

        this.change = function () {
            dirLight.position.set(controls.lightX, controls.lightY, controls.lightZ);
            dirLight.distance = controls.lightDistance;

            camera.position.set(controls.cameraX, controls.cameraY, controls.cameraZ);
            camera.lookAt(new THREE.Vector3(controls.cameraLookAtX, controls.cameraLookAtY, controls.cameraLookAtZ));
            scene.position.set(controls.sceneX, controls.sceneY, controls.sceneZ);

            orbitControl.minDistance = controls.orbiMinDistance;
            orbitControl.maxDistance = controls.orbiMaxDistance;
        }
    };

    var gui = new dat.GUI();
    //调整灯光位置
    gui.addFolder("Light");
    gui.add(controls, "lightX", 0, 100).onChange(controls.change);
    gui.add(controls, "lightY", 0, 100).onChange(controls.change);
    gui.add(controls, "lightZ", 0, 100).onChange(controls.change);
    gui.add(controls, "lightDistance", 0, 10000).onChange(controls.change);

    //调整摄像头位置
    gui.addFolder("Camera");
    gui.add(controls, "cameraX", 0, 500).onChange(controls.change);
    gui.add(controls, "cameraY", 0, 500).onChange(controls.change);
    gui.add(controls, "cameraZ", 0, 500).onChange(controls.change);

    //跳帧摄像头lookAt位置
    gui.add(controls, "cameraLookAtX", -100, 500).onChange(controls.change);
    gui.add(controls, "cameraLookAtY", -100, 500).onChange(controls.change);
    gui.add(controls, "cameraLookAtZ", -100, 500).onChange(controls.change);

    //跳帧场景位置
    gui.addFolder("Scene");
    gui.add(controls, "sceneX", -100, 500).onChange(controls.change);
    gui.add(controls, "sceneY", -100, 500).onChange(controls.change);
    gui.add(controls, "sceneZ", -100, 500).onChange(controls.change);

    //调整OrbitControl
    gui.addFolder("OrbitControl");
    gui.add(controls, "orbiMinDistance", 0, 1000).onChange(controls.change);
    gui.add(controls, "orbiMaxDistance", 0, 1000).onChange(controls.change);

    render();

    function render() {
        orbitControl.update();

        requestAnimationFrame(render);
        renderer.render(scene, camera);
    }

    var car_mesh;

    /**
     * 1.加载汽车模型和加载车库应该分开
     * 2.汽车模型的轮胎视固定不变的，但轮毂的颜色是动态的
     * 3.汽车不同的品牌，车身、保险杠、玻璃、内饰、底盘阴影都是动态的，并且车身颜色是可变化的
     * 4.加载进度展示
     */
    function loadCarVisualizer() {
        car_mesh = new THREE.Object3D();

        var loader = new THREE.SceneLoader();
        loader.load("assets/models/carvisualizer.js", function (object) {
            var material = new THREE.MeshBasicMaterial({color: 0xff0000});
    //scene.add(garageMesh);
            var mesh = object.objects["aston_body"]; //aston_bumper aston_glass aston_interior
            mesh.scale.set(0.1, 0.1, 0.1);
            var aston_body_material = mesh.material.materials[0];
            aston_body_material.envMap = textureCube;
            aston_body_material.transparent = true;
            aston_body_material.reflectivity = 0.5;
            car_mesh.add(mesh);
            var aston_bumper_mesh = object.objects["aston_bumper"]; //aston_bumper aston_glass aston_interior
            aston_bumper_mesh.scale.set(0.1, 0.1, 0.1);
            var aston_bumper_material = aston_bumper_mesh.material.materials[0];
            aston_bumper_material.transparent = true;
            aston_bumper_material.envMap = textureCube;
            aston_bumper_material.reflectivity = 0.8;
            car_mesh.add(aston_bumper_mesh);

            var aston_glass_mesh = object.objects["aston_glass"]; //aston_bumper aston_glass aston_interior
            aston_glass_mesh.scale.set(0.1, 0.1, 0.1);

            var aston_glass_material = aston_glass_mesh.material.materials[0];
            //aston_glass_material.color = new THREE.Color(0xff0000, 1.0);
            aston_glass_material.transparent = true;
            aston_glass_material.envMap = textureCube;
            aston_glass_material.opacity = 0.4;
            car_mesh.add(aston_glass_mesh);

            var aston_interior_mesh = object.objects["aston_interior"]; //aston_bumper aston_glass aston_interior
            aston_interior_mesh.scale.set(0.1, 0.1, 0.1);
            var aston_interior_material = aston_interior_mesh.material.materials[0];
            aston_interior_material.map = THREE.ImageUtils.loadTexture("assets/textures/aston/i01.jpg");
            car_mesh.add(aston_interior_mesh);

            var wheel_front_left_mesh = new THREE.Object3D();
            var wheel_front_right_mesh = new THREE.Object3D();
            var wheel_back_left_mesh = new THREE.Object3D();
            var wheel_back_right_mesh = new THREE.Object3D();


            var wheel_part_mesh = object.objects["wheel"];
            wheel_part_mesh.scale.set(0.1, 0.1, 0.1);
            var wheel_material = wheel_part_mesh.material.materials[0];
            wheel_material.map = THREE.ImageUtils.loadTexture("assets/textures/autoparts/wheel.png");
            //wheel_mesh.add(wheel_part_mesh);
            wheel_front_left_mesh.add(wheel_part_mesh.clone());
            wheel_front_right_mesh.add(wheel_part_mesh.clone());
            wheel_back_left_mesh.add(wheel_part_mesh.clone());
            wheel_back_right_mesh.add(wheel_part_mesh.clone());
            var rim_part_mesh = object.objects["rim"].clone();
            rim_part_mesh.scale.set(0.1, 0.1, 0.1);
            var rim_material = rim_part_mesh.material.materials[0];
            rim_material.envMap = textureCube;
            rim_material.reflectivity = 0.4;

            wheel_front_left_mesh.add(rim_part_mesh.clone());
            wheel_front_right_mesh.add(rim_part_mesh.clone());
            wheel_back_left_mesh.add(rim_part_mesh.clone());
            wheel_back_right_mesh.add(rim_part_mesh.clone());

            wheel_front_left_mesh.position.x = -16;
            wheel_front_left_mesh.position.z = 27;
            wheel_front_right_mesh.position.x = 16;
            wheel_front_right_mesh.position.z = 27;
            wheel_front_right_mesh.rotation.y = -Math.PI;
            wheel_back_left_mesh.position.x = -16;
            wheel_back_left_mesh.position.z = -24.5;
            wheel_back_right_mesh.position.x = 16;
            wheel_back_right_mesh.position.z = -24.5;
            wheel_back_right_mesh.rotation.y = -Math.PI;

            car_mesh.add(wheel_front_left_mesh);
            car_mesh.add(wheel_front_right_mesh);
            car_mesh.add(wheel_back_left_mesh);
            car_mesh.add(wheel_back_right_mesh);

            //car_shadow floor floor_shadow garage
            var car_shadow_mesh = object.objects["car_shadow"];
            car_shadow_mesh.scale.set(0.1, 0.1, 0.1);
            var car_shadow_material = car_shadow_mesh.material.materials[0];
            car_shadow_material.map = THREE.ImageUtils.loadTexture("assets/textures/aston/s01.png");
            car_shadow_material.transparent = true;
            car_mesh.add(car_shadow_mesh);

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

            scene.add(floor_mesh);

            //渲染floor_shadow网格
            var floor_shadow_mesh = object.objects["floor_shadow"];
            floor_shadow_mesh.scale.set(0.1, 0.1, 0.1);

            var floor_shadow__texture = THREE.ImageUtils.loadTexture("assets/textures/garage/floorShadow.png");
            var floor_shadow_material = floor_shadow_mesh.material.materials[0];
            floor_shadow_material.map = floor_shadow__texture;
            floor_shadow_material.color = new THREE.Color(0xffffff, 0.0);
            floor_shadow_material.transparent = true;
            scene.add(floor_shadow_mesh);

            var garage_mesh = object.objects["garage"];
            garage_mesh.scale.set(0.1, 0.1, 0.1);

            var garage_texture = THREE.ImageUtils.loadTexture("assets/textures/garage/garage.jpg");
            var garage_material = garage_mesh.material.materials[0];
            garage_material.map = garage_texture;
            garage_material.color = new THREE.Color(0xffffff, 0.0);

            scene.add(garage_mesh);
        }, function(event){
            //使用loaded和total设置加载进度
        });

        car_mesh.rotation.y = -0.25 * Math.PI;

        scene.add(car_mesh);
    }
}

/**
 * 创建模拟环境纹理盒子
 * @returns {*}
 */
function createCubeMap() {
    var path = "assets/textures/garage/";
    var format = ".jpg";

    var urls = [
        path + "positiveX" + format, path + "negativeX" + format,
        path + "positiveY" + format, path + "negativeY" + format,
        path + "positiveZ" + format, path + "negativeZ" + format
    ];

    var textureCube = THREE.ImageUtils.loadTextureCube(urls, THREE.CubeReflectionMapping());
    textureCube

    return textureCube;
}

window.onload = init;