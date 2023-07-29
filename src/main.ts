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

const canvas = <HTMLCanvasElement> document.getElementById("gfx-main")

const renderer = new WebGPURenderer(canvas)

const camera = new FrustumViewCamera(45, canvas.width / canvas.height, 0.1, 1000)
camera.position = ([0, 5, 20])
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

const sphere = new Sphere(1, 32, 32)
const simpleMaterial = new SimpleMaterial(new Color(1, 0, 0))
const sphereMesh : Mesh = new Mesh(sphere, simpleMaterial)
sphereMesh.translateX(4)
scene.addChild(sphereMesh)

let translate = -0.05
const animation = () => {
    if (sphereMesh.position[1] > 0 || sphereMesh.position[1] < -4.2) {
        translate = -translate
    }
    sphereMesh.translateY(translate)

    renderer.render(scene)
    requestAnimationFrame(animation)
}

renderer.Initialize().then(() => {
    animation()
})
