import {WebGPURenderer} from "./Renderers/WebGPURenderer"
import {Scene} from "./Scene/Scene"
import {Sphere} from "./Geometries/Sphere"
import {Mesh} from "./Objects/Mesh"
import {FrustumViewCamera} from "./Cameras/FrustumViewCamera"
import {Color} from "./Utils/Color"
import {PhongMaterial} from "./Materials/PhongMaterial"
import {PointLight} from "./Lights/PointLight"
import {Plane} from "./Geometries/Plane";
import {SimpleMaterial} from "./Materials/SimpleMaterial";
import {BufferObject} from "./Objects/BufferObject";
import {ParentObject} from "./Objects/ParentObject";
import {Group} from "./Objects/Group";
import {NormalMaterial} from "./Materials/NormalMaterial";

const canvas = <HTMLCanvasElement> document.getElementById("gfx-main")

const renderer = new WebGPURenderer(canvas)
const initializing = renderer.Initialize()

const camera = new FrustumViewCamera(45, canvas.width / canvas.height, 0.1, 1000)
camera.position = ([0, 0, 20])
camera.lookAt([0, -5, 0])

const scene = new Scene(camera)

const pointLight = new PointLight(new Color(0.8, 0.5, 0.8), 1)
pointLight.translateXYZ([4, 1, 0])
scene.addChild(pointLight)

const plane = new Plane(20, 20, 8, 8)
const phongMaterial = new PhongMaterial()
const planeMesh = new Mesh(plane, phongMaterial)
planeMesh.translateY(-5)
planeMesh.rotateX(-Math.PI / 2)
scene.addChild(planeMesh)

const spheres = new Group()
const sphere = new Sphere(1, 32, 32)
const simpleMaterial = new SimpleMaterial(new Color(1, 0, 0))

for (let i = 0; i < 4; i++) {
    // const sphere = new Sphere(1, 32, 32)
    // const simpleMaterial = new SimpleMaterial(new Color(1, 0, 0))
    const sphereMesh = new Mesh(sphere, simpleMaterial)
    sphereMesh.translateX(Math.random() * 10 - 5)
    spheres.addChild(sphereMesh)
    // scene.addChild(sphereMesh)
}

scene.addChild(spheres)

let frameCount = 0
let lastTime = 0

const calculateFPS = () => {
    const currentTime = performance.now()
    const elapsed = currentTime - lastTime
    const fps = Math.round(1000 / elapsed)
    lastTime = currentTime

    return fps
}

let translate = -0.1
spheres.translateY(translate)

const animation = () => {
    if (spheres.children[0].position[1] > 0 || spheres.children[0].position[1] < -4) {
        translate = -translate
        spheres.translateY(translate * 2)
    }
    spheres.transformed = true

    let fps
    fps = calculateFPS()
    console.log(`FPS: ${fps}`)

    renderer.render(scene)
    frameCount++

    requestAnimationFrame(animation)
}

initializing.then(() => {
    animation()
})
