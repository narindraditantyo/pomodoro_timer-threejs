import * as THREE from './three.js/build/three.module.js'
import { OrbitControls } from './three.js/examples/jsm/controls/OrbitControls.js'
import { GLTFLoader } from './three.js/examples/jsm/loaders/GLTFLoader.js'

var sWidth, sHeight

const secondsPerMinute = 60
const workSession = secondsPerMinute * 25
const breakSession = secondsPerMinute * 5
var currentSession = workSession
var isPaused = true
var countdownStarted = false
var timeLeftInSeconds, addedSeconds, interval

let scene, camera, renderer, control
let geometry, material, mesh, loader, arrTexture, clockMesh
let light

let createSkybox = () => {
    geometry = new THREE.BoxGeometry(500, 500, 500)
    loader = new THREE.TextureLoader()
    arrTexture = [
        loader.load('./assets/skybox/skybox_0.png'),
        loader.load('./assets/skybox/skybox_1.png'),
        loader.load('./assets/skybox/skybox_2.png'),
        loader.load('./assets/skybox/skybox_3.png'),
        loader.load('./assets/skybox/skybox_4.png'),
        loader.load('./assets/skybox/skybox_5.png'),
    ]
    material = arrTexture.map(texture => {
        return new THREE.MeshBasicMaterial({
            map: texture,
            side: THREE.BackSide
        })
    })
    mesh = new THREE.Mesh(geometry, material)
    mesh.position.y = -25
    scene.add(mesh)
}

let setAmbientLight = () => {
    light = new THREE.PointLight(0xFFFFFF, 1, 1000)
    light.position.set(50, 50, 50)
    light.shadow.mapSize.width = 2048
    light.shadow.mapSize.height = 2048
    light.castShadow = true
    light.target = scene
    scene.add(light)
}

let createPlane = () => {
    geometry = new THREE.PlaneGeometry(25, 25)
    material = new THREE.MeshPhongMaterial({
        color: 0x121212
    })
    mesh = new THREE.Mesh(geometry, material)
    mesh.position.y = -2.125
    mesh.rotation.x = -(Math.PI/2)
    scene.add(mesh)
}

let loadDesk = () => {
    loader = new GLTFLoader()
    loader.load('./assets/model/old_desk.gltf', (gltf) => {
        let loadedDesk = gltf.scene
        loadedDesk.position.set(0, 0, 0)
        loadedDesk.scale.set(5, 5, 5)
        scene.add(loadedDesk)
    })
}

let createClock = () => {
    geometry = new THREE.BoxGeometry(6.25, 3.125, 0.1)
    material = new THREE.MeshBasicMaterial({
        color: 0x121212,
        transparent: true,
        opacity: 0.75
    })
    mesh = new THREE.Mesh(geometry, material)
    mesh.castShadow = true
    mesh.position.set(0, 3.875, 1)

    light = new THREE.PointLight(0xFFFFFF, 5)
    light.castShadow = true
    mesh.add(light)

    scene.add(mesh)
}

let playPauseCountdown = () => {
    isPaused = !isPaused
    
    if(!countdownStarted) {
        resetCountdown()
        updateTimeString()
    }
  
    countdownStarted = true
  
    if(isPaused) {
        stopCountdown()
    } else {
        interval = setInterval(updateCountdown, 1000);
    }
}

let restartCountdown = () => {
    stopCountdown()
    resetCountdown()
  
    isPaused = true

    updateTimeString()
}

function updateCountdown() {
    if(isPaused) {
      return
    }
  
    timeLeftInSeconds--;
  
    updateTimeString();
  
    if(timeLeftInSeconds == 0) {
      stopCountdown()
      isPaused = true
    }
  }
  
  function stopCountdown() {
    clearInterval(interval)
  }
  
  function resetCountdown() {
    isPaused = false
    timeLeftInSeconds = workSession
  }
  
  function updateTimeString() {
    let minutes = Math.floor(timeLeftInSeconds / secondsPerMinute);
    let seconds = timeLeftInSeconds % secondsPerMinute;
  
    if(seconds < 10) {
        addedSeconds = "0" + seconds
    } else {
        addedSeconds = seconds
    }
  
    currentSession = minutes + ":" + addedSeconds;
    scene.remove(clockMesh)
    sevenSegment(currentSession)
  }

let sevenSegment = (currentSession) => {
    loader = new THREE.FontLoader()
    loader.load('./three.js/examples/fonts/optimer_regular.typeface.json', (font) => {
        geometry = new THREE.TextGeometry(currentSession, {
            font: font,
            size: 1,
            height: 0.1
        })
        geometry.center()
        material = new THREE.MeshStandardMaterial()
        clockMesh = new THREE.Mesh(geometry, material)
        clockMesh.position.set(0, 3.875, 1.1)
        scene.add(clockMesh)
    })
}

let init = () => {
    sWidth = window.innerWidth
    sHeight = window.innerHeight

    scene  = new THREE.Scene()

    camera = new THREE.PerspectiveCamera(45, sWidth/sHeight, 1, 3000)
    camera.position.set(0, 5, 10)
    camera.lookAt(0, 2.5, 0)
    
    renderer = new THREE.WebGLRenderer({
        antialias: true
    })
    renderer.setSize(sWidth, sHeight)
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap

    document.body.appendChild(renderer.domElement)

    window.addEventListener('resize', () => {
        sWidth = window.innerWidth
        sHeight = window.innerHeight
        renderer.setSize(sWidth, sHeight)

        camera.aspect = sWidth/sHeight
        camera.updateProjectionMatrix()
    })

    window.addEventListener('keydown', (event) => {
        var keyPressed = event.code

        if(keyPressed == 'Space') {
            console.log("start/pause")
            playPauseCountdown()
        } else if(keyPressed == 'KeyR') {
            console.log("reset")
            restartCountdown()
        }
    })

    // control = new OrbitControls(camera, renderer.domElement)
    // control.addEventListener('change', renderer)

    createSkybox()
    setAmbientLight()
    createPlane()

    loadDesk()

    createClock()
    sevenSegment('25:00')

    animate()
}


let animate = () => {
    renderer.render(scene, camera)
    requestAnimationFrame(animate)
}

window.onload = () => {
    init()
}