/**
 * 汽车展厅
 * 参考网站：http://carvisualizer.plus360degrees.com/threejs/
 */
var garageMesh, wheelMesh;

function init(){
    var scene = new THREE.Scene();

    var camera = new THREE.PerspectiveCamera(45.0, window.innerWidth/window.innerHeight, 0.1, 1000);
    camera.position.set(0, 100, 0);
    camera.lookAt(scene.position);

    var renderer = new THREE.WebGLRenderer();
    renderer.setClearColor(new THREE.Color(0x000000), 1.0);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMapEnabled = true;

    var orbitControl = new THREE.OrbitControls(camera);

    var textureCube = createCubeMap();
    var shader = THREE.ShaderLib["cube"];
    shader.uniforms["tCube"].value = textureCube;
    var material = new THREE.ShaderMaterial({
        vertexShader: shader.vertexShader,
        fragmentShader: shader.fragmentShader,
        uniforms: shader.uniforms,
        depthWrite: false,
        side: THREE.BackSide
    });
    //var cubeMap = new THREE.Mesh(new THREE.BoxGeometry(512, 512, 512), material);
    //cubeMap.position.set(0, 0, 0);
    //scene.add(cubeMap);

    //var floorShadowPlane = createFloorShadow();
    //floorShadowPlane.position.set(0, -100 , 0);
    //floorShadowPlane.rotation.x = -0.5 * Math.PI;
    //scene.add(floorShadowPlane);


    //wheelMesh = new THREE.Object3D();

    //loadFloor();
    loadAudi();
    loadWheel();

    var ambientLight = new THREE.AmbientLight(0xffffff);
    scene.add(ambientLight);

    var dirLight = new THREE.DirectionalLight(0xffffff);
    dirLight.position.set(-34, 40, 50);
    dirLight.intensity =0.8;
    scene.add(dirLight);

    document.getElementById("webgl-output").appendChild(renderer.domElement);


    //var controls = new function(){
    //    this.wheelX = wheelMesh.position.x;
    //    this.wheelZ = wheelMesh.position.z;
    //
    //    this.change = function(){
    //        wheelMesh.position.x = controls.wheelX;
    //        wheelMesh.position.z = controls.wheelZ;
    //    }
    //};
    //
    //var gui = new dat.GUI();
    //gui.add(controls, "wheelX", -100, 100).onChange(controls.change);
    //gui.add(controls, "wheelZ", -100, 100).onChange(controls.change);

    render();

    function render(){
        orbitControl.update();

        requestAnimationFrame(render);
        renderer.render(scene, camera);
    }

    function loadGarage(){
        var loader = new THREE.JSONLoader();
        loader.load("assets/models/carvisualizer.garage.js", function(geom){
            var material = new THREE.MeshBasicMaterial({color: 0xff0000});
            garageMesh = new THREE.Mesh(geom, material);
            garageMesh.scale.set(0,5, 0.5, 0.5);

            geom.computeMorphNormals();
            geom.computeVertexNormals();
            geom.computeFaceNormals();

            scene.add(garageMesh);


        }, "assets/textures/garage/");
    }

    function loadFloor(){
        var loader = new THREE.JSONLoader();
        loader.load("assets/models/carvisualizer.floor.js", function(geom){
            var texture = THREE.ImageUtils.loadTexture("assets/textures/garage/floor.jpg");
            var material = new THREE.MeshLambertMaterial({map: texture});
            material.wrapS = THREE.RepeatWrapping;
            material.wrapT = THREE.RepeatWrapping;
            //material.map.repeat.set(100, 100);
            garageMesh = new THREE.Mesh(geom, material);
            //garageMesh.scale.set(0,5, 0.5, 0.5);

            geom.computeMorphNormals();
            geom.computeVertexNormals();
            geom.computeFaceNormals();

            scene.add(garageMesh);


        }, "assets/textures/garage/");
    }

    function loadAudi(){
        var bodyLoader = new THREE.JSONLoader();
        bodyLoader.load("assets/models/carvisualizer.audi_body.js", function(geom){
            var texture = THREE.ImageUtils.loadTexture("assets/textures/audi/i01.jpg");
            var material = new THREE.MeshBasicMaterial({color: 0xff0000, envMap: textureCube, shininess: 40,  transparent: true, side: THREE.DoubleSide});
            material.shading = THREE.SmoothShading;
            material.reflectivity = 0.8;
           // material.reflectivity = 0.1;
            var mesh = new THREE.Mesh(geom, material);

            mesh.scale.set(0.1, 0.1, 0.1);

            geom.computeMorphNormals();
            geom.computeVertexNormals();
            geom.computeFaceNormals();

            scene.add(mesh);


        }, "assets/textures/garage/");

        var bumperLoader = new THREE.JSONLoader();
        bumperLoader.load("assets/models/carvisualizer.audi_bumper.js", function(geom){
            var texture = THREE.ImageUtils.loadTexture("assets/textures/audi/i01.jpg");
            var material = new THREE.MeshBasicMaterial({color: 0x444444, envMap: textureCube, shininess: 40,  transparent: true, side: THREE.DoubleSide});
            material.shading = THREE.SmoothShading;
            material.reflectivity = 0.6;

            var mesh = new THREE.Mesh(geom, material);

            mesh.scale.set(0.1, 0.1, 0.1);

            geom.computeMorphNormals();
            geom.computeVertexNormals();
            geom.computeFaceNormals();

            scene.add(mesh);


        }, "assets/textures/garage/");

        var glassLoader = new THREE.JSONLoader();
        glassLoader.load("assets/models/carvisualizer.audi_glass.js", function(geom){
            var texture = THREE.ImageUtils.loadTexture("assets/textures/audi/i01.jpg");
            var material = new THREE.MeshBasicMaterial({color: new THREE.Color(0x000000, 1.0), transparent:true, opacity: 0.5});
            var mesh = new THREE.Mesh(geom, material);

            mesh.scale.set(0.1, 0.1, 0.1);

            geom.computeMorphNormals();
            geom.computeVertexNormals();
            geom.computeFaceNormals();

            scene.add(mesh);


        }, "assets/textures/garage/");

        var interiorLoader = new THREE.JSONLoader();
        interiorLoader.load("assets/models/carvisualizer.audi_interior.js", function(geom){
            var texture = THREE.ImageUtils.loadTexture("assets/textures/audi/i01.jpg");
            var material = new THREE.MeshBasicMaterial({map: texture});
            material.intensity = 1.2;
            var mesh = new THREE.Mesh(geom, material);

            mesh.scale.set(0.1, 0.1, 0.1);

            geom.computeMorphNormals();
            geom.computeVertexNormals();
            geom.computeFaceNormals();

            scene.add(mesh);


        }, "assets/textures/garage/");
    }

    function loadWheel(){
        var wheelOjbect = new THREE.Object3D();

        var frontLeftWheel = new THREE.Object3D();
        frontLeftWheel.rotation.y = - Math.PI;
        frontLeftWheel.position.x = 13.5;
        frontLeftWheel.position.z = 23.5;

        var frontRightWheel = new THREE.Object3D();
        frontRightWheel.position.x = -13.5;
        frontRightWheel.position.z = 23.5;

        var backLeftWheel = new THREE.Object3D();
        backLeftWheel.rotation.y = -Math.PI;
        backLeftWheel.position.x = 13.5;
        backLeftWheel.position.z = -26.9;

        var backRightWheel = new THREE.Object3D();
        backRightWheel.position.x = -13.5;
        backRightWheel.position.z = -26.9;

        var wheelLoader = new THREE.JSONLoader();
        wheelLoader.load("assets/models/carvisualizer.wheel.js", function(geom){
            var texture = THREE.ImageUtils.loadTexture("assets/textures/autoparts/wheel.png");
            var material = new THREE.MeshBasicMaterial({map: texture});
            material.intensity = 1.2;
            var mesh = new THREE.Mesh(geom, material);

            mesh.scale.set(0.1, 0.1, 0.1);

            geom.computeMorphNormals();
            geom.computeVertexNormals();
            geom.computeFaceNormals();

            frontLeftWheel.add(mesh.clone());
            frontRightWheel.add(mesh.clone());
            backLeftWheel.add(mesh.clone());
            backRightWheel.add(mesh.clone());

        }, "assets/textures/garage/");

        var rimLoader = new THREE.JSONLoader();
        rimLoader.load("assets/models/carvisualizer.rim.js", function(geom){
            var material = new THREE.MeshBasicMaterial({color: 0x00ff00, envMap: textureCube, shininess: 40,  transparent: true, side: THREE.DoubleSide});
            material.shading = THREE.SmoothShading;
            material.reflectivity = 0.8;
            var mesh = new THREE.Mesh(geom, material);

            mesh.scale.set(0.1, 0.1, 0.1);

            geom.computeMorphNormals();
            geom.computeVertexNormals();
            geom.computeFaceNormals();

            frontLeftWheel.add(mesh.clone());
            frontRightWheel.add(mesh.clone());
            backLeftWheel.add(mesh.clone());
            backRightWheel.add(mesh.clone());
        }, "assets/textures/garage/");

        wheelOjbect.add(frontLeftWheel);
        wheelOjbect.add(frontRightWheel);
        wheelOjbect.add(backLeftWheel);
        wheelOjbect.add(backRightWheel);

        scene.add(wheelOjbect);
    }
}


function createFloorShadow(){
    var geometry = new THREE.PlaneGeometry(512, 512, 1, 1);
    var texture = THREE.ImageUtils.loadTexture("assets/textures/garage/floorShadow.png");
    var material = new THREE.MeshPhongMaterial({color: 0xeeeeee, map: texture});
    material.intensity = 1.2;

    var mesh =new THREE.Mesh(geometry, material);

    return mesh;
}

/**
 * 创建模拟环境纹理盒子
 * @returns {*}
 */
function createCubeMap(){
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
