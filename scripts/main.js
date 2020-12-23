import * as THREE from '../three.js/build/three.module.js'

var sWidth, sHeight

function init() {
    sWidth = window.innerWidth
    sHeight = window.innerHeight

    let scene  = new THREE.Scene()

    let camera = new THREE.PerspectiveCamera(45, sWidth/sHeight, 1, 3000)
    camera.position.set(0, 0, 0)
    camera.lookAt(0, 0, 0)

    let renderer = new THREE.WebGLRenderer({
        antialias: true
    })
    renderer.setSize(sWidth, sHeight)

    renderer.render(scene, camera)
}

window.onload = () => {
    init()
}