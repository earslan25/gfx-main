# gfx-main

This library is a wrapper around the WebGPU API. It provides a simple API for creating a
renderer, a camera, a scene, meshes, lights, materials, and textures. It aims to make it
easy to create 3D scenes and render them using WebGPU, by abstracting away the low-level
details of the API.

**Usage**

The code below creates a WebGPU renderer, a camera, a scene, and two meshes - a plane and a sphere. It then renders the scene and animates the sphere to go up and down as if it is bouncing on the plane.

```javascript
// get the canvas element that has id="gfx-main"
const canvas = document.getElementById("gfx-main")

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
```

**Version 1.0**

This is the first version of the library. It is still in development, and there are many
features that are not yet implemented. Currently, the library supports the following:

- WebGPU renderer
- Frustum/Parallel view camera
- Scene
- Mesh
- Cone/Cylinder/Plane/Sphere/Cube/Triangle geometry
- Simple/Normal/Phong material
- Point/Directional/Spot/Ambient light
- Texture
- .obj file loader

**Future Versions**

The following features are planned for the next 2.0 version:

- CPU and memory optimizations, for example by not creating new 
buffers every frame, as currently copying buffers every frame causes CPU bottlenecks when rendering many geometries
- Ray tracing renderer with compute shaders and ray tracing acceleration structures (BVH)
- Post-processing filters
- Shadow mapping for the WebGPU renderer
- Environment mapping
- Scene navigation using mouse and keyboard

**Credits**

During the development of this library, three.js was a source of inspiration for the API design. Furthermore, 
the code for the geometry classes was adapted from the three.js source code.