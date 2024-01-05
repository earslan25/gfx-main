import fragPhongShader from "./Shaders/WebGPUShaders/fragPhong.wgsl"
import fragPhongTextureShader from "./Shaders/WebGPUShaders/fragPhongTexture.wgsl"
import fragNormalShader from "./Shaders/WebGPUShaders/fragNormal.wgsl"
import fragSimpleShader from "./Shaders/WebGPUShaders/fragSimple.wgsl"
import fragSimpleTextureShader from "./Shaders/WebGPUShaders/fragSimpleTexture.wgsl"
import vertShader from "./Shaders/WebGPUShaders/vert.wgsl"
import { Mesh } from "../Objects/Mesh"
import { Scene } from "../Scene/Scene"
import { mat4, vec3 } from "gl-matrix"
import { BufferObject } from "../Objects/BufferObject"
import { ParentObject } from "../Objects/ParentObject"
import { MainObject } from "../Objects/MainObject"
import { Color } from "../Utils/Color"
import { SceneGlobalParameters } from "../Utils/SceneGlobalParameters"
import { Material } from "../Materials/Material"
import { Light } from "../Lights/Light"
import { PointLight } from "../Lights/PointLight"
import { NormalMaterial } from "../Materials/NormalMaterial"
import { SimpleMaterial } from "../Materials/SimpleMaterial"
import { TexturedMaterial } from "../Materials/TexturedMaterial"

export class WebGPURenderer {

    extendsWebGPURenderer : boolean = true
    type : string = "WebGPURenderer"

    canvas : HTMLCanvasElement

    backgroundColor : Color

    // maybe move depth buffer to texture later
    useDepthBuffer : boolean
    useAntialiasing : boolean
    sampleCount : number = 4
    useAlphaPremultiplied : boolean

    adapter! : GPUAdapter
    device! : GPUDevice
    context! : GPUCanvasContext
    format! : GPUTextureFormat

    pipelines : { [key : number] : GPURenderPipeline } = {}
    bindGroupLayouts! : GPUBindGroupLayout[]

    vertShaderModules : { [key : string] : GPUShaderModule } = {}
    fragShaderModules : { [key : string] : GPUShaderModule } = {}

    frameGroupLayout! : GPUBindGroupLayout
    frameBindGroup! : GPUBindGroup

    materialBindGroups : { [key : string] : GPUBindGroup } = {}
    materialGroupLayout! : GPUBindGroupLayout

    lightGroupLayout! : GPUBindGroupLayout
    lightBindGroup! : GPUBindGroup

    cameraUniformBuffer! : GPUBuffer
    objectModelBuffer! : GPUBuffer
    modelBuffer : Float32Array

    lightBuffer! : GPUBuffer
    lightSourceBuffer : Float32Array
    wsCameraPositionUniformBuffer! : GPUBuffer

    depthStencilState! : GPUDepthStencilState
    depthStencilBuffer! : GPUTexture
    depthStencilView! : GPUTextureView
    depthStencilAttachment! : GPURenderPassDepthStencilAttachment

    constructor(canvas : HTMLCanvasElement, depthBuffer : boolean = true,
                antialiasing : boolean = true, alphaPremultiplied : boolean = false,
                backgroundColor : Color = new Color(0.5, 0.8, 0.8)) {

        if (navigator.gpu === undefined) {
            throw "WebGPU not supported"
        }

        this.canvas = canvas

        this.useDepthBuffer = depthBuffer
        this.useAntialiasing = antialiasing
        this.useAlphaPremultiplied = alphaPremultiplied

        this.backgroundColor = backgroundColor

        this.modelBuffer = new Float32Array(16 * 4096)
        this.lightSourceBuffer = new Float32Array(20 * 512)

    }

    async Initialize() {

        await this.setupDevice()

        await this.makeBindGroupLayouts()

        await this.createAssets()

        if (this.useDepthBuffer) {
            await this.makeDepthBufferResources()
        }

        await this.makePipelineData()

        await this.makeBindGroups()

    }

    async setupDevice() {

        this.adapter = <GPUAdapter> await navigator.gpu?.requestAdapter()

        this.device = <GPUDevice> await this.adapter?.requestDevice()

        this.context = <GPUCanvasContext> this.canvas.getContext("webgpu")

        this.format = "bgra8unorm"

        this.context.configure({
            device: this.device,
            format: this.format,
            alphaMode: this.useAlphaPremultiplied ? "premultiplied" : "opaque"
        })

    }

    async createAssets() {

        this.cameraUniformBuffer = this.device.createBuffer({
            size: 4 * 16,
            usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
        })

        this.objectModelBuffer = this.device.createBuffer({
            size: 4 * 16 * 4096,
            usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST
        })

        this.lightBuffer = this.device.createBuffer({
            size: 4 * 20 * 512 + 4 * 4,
            usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST
        })

        this.wsCameraPositionUniformBuffer = this.device.createBuffer({
            size: 4 * 4,
            usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
        })

    }

    async makeDepthBufferResources() {

        this.depthStencilState = {
            depthWriteEnabled: true,
            depthCompare: "less-equal",
            format: "depth24plus-stencil8"
        }

        const size : GPUExtent3D = {
            width: this.canvas.width,
            height: this.canvas.height,
            depthOrArrayLayers: 1
        }
        const depthBufferDescriptor : GPUTextureDescriptor = {
            size: size,
            format: this.depthStencilState.format,
            usage: GPUTextureUsage.RENDER_ATTACHMENT,
            sampleCount: this.useAntialiasing ? this.sampleCount : 1
        }
        this.depthStencilBuffer = this.device.createTexture(depthBufferDescriptor)

        const viewDescriptor : GPUTextureViewDescriptor = {
            format: this.depthStencilState.format,
            dimension: "2d",
            aspect: "all",
        }
        this.depthStencilView = this.depthStencilBuffer.createView(viewDescriptor)
        this.depthStencilAttachment = {
            view: this.depthStencilView,
            depthClearValue: 1.0,
            depthLoadOp: "clear",
            depthStoreOp: "store",
            stencilLoadOp: "clear",
            stencilStoreOp: "discard"
        }

    }

    async makeBindGroupLayouts() {

        this.frameGroupLayout = this.device.createBindGroupLayout({
            entries: [
                {
                    binding: 0,
                    visibility: GPUShaderStage.VERTEX,
                    buffer : {
                        type: "uniform"
                    }
                },
                {
                    binding: 1,
                    visibility: GPUShaderStage.VERTEX,
                    buffer: {
                        type: "read-only-storage",
                        hasDynamicOffset: false
                    }
                },
            ]
        })

        this.lightGroupLayout = this.device.createBindGroupLayout({
            entries: [
                {
                    binding: 0,
                    visibility: GPUShaderStage.FRAGMENT,
                    buffer: {
                        type: "read-only-storage",
                        hasDynamicOffset: false
                    }
                },
                {
                    binding: 1,
                    visibility: GPUShaderStage.FRAGMENT,
                    buffer: {
                        type: "uniform"
                    }
                }
            ]
        })

        this.materialGroupLayout = this.device.createBindGroupLayout({
            entries: [
                {
                    binding: 0,
                    visibility: GPUShaderStage.FRAGMENT,
                    buffer: {
                        type: "uniform"
                    }
                }
            ]
        })

    }

    // currently compiles all shaders for all materials
    async makePipelineData() {

        this.bindGroupLayouts = [this.frameGroupLayout, this.lightGroupLayout]

        const vertModules : string[] = [
            vertShader,
        ]
        const vertModuleNames : string[] = [
            "vs_main",
        ]

        const fragModules : string[] = [
            fragPhongShader,
            fragPhongTextureShader,
            fragNormalShader,
            fragSimpleShader,
            fragSimpleTextureShader,
        ]
        const fragModuleNames : string[] = [
            "fs_phong",
            "fs_phong_texture",
            "fs_normal",
            "fs_simple",
            "fs_simple_texture",
        ]

        for (let i = 0; i < vertModules.length; i++) {
            this.vertShaderModules[vertModuleNames[i]] = this.device.createShaderModule({
                code: vertModules[i],
            })
        }

        for (let i = 0; i < fragModules.length; i++) {
            this.fragShaderModules[fragModuleNames[i]] = this.device.createShaderModule({
                code: fragModules[i],
            })
        }

    }

    async makeBindGroups() {

        this.frameBindGroup = this.device.createBindGroup({
            layout: this.frameGroupLayout,
            entries: [
                {
                    binding: 0,
                    resource: {
                        buffer: this.cameraUniformBuffer
                    }
                },
                {
                    binding: 1,
                    resource: {
                        buffer: this.objectModelBuffer
                    }
                },
            ]
        })

        this.lightBindGroup = this.device.createBindGroup({
            layout: this.lightGroupLayout,
            entries: [
                {
                    binding: 0,
                    resource: {
                        buffer: this.lightBuffer
                    }
                },
                {
                    binding: 1,
                    resource: {
                        buffer: this.wsCameraPositionUniformBuffer
                    }
                }
            ]
        })

    }

    makePipeline(vertexLayout : GPUVertexBufferLayout, cullMode : GPUCullMode, material : Material,
                 groupLayouts : GPUBindGroupLayout[]) {

        const pipelineLayout : GPUPipelineLayout = this.device.createPipelineLayout({
            bindGroupLayouts: groupLayouts,
        })

        const vertexState : GPUVertexState = {
            module: this.vertShaderModules['vs_main'],
            entryPoint: 'vs_main',
            buffers: [vertexLayout],
        }
        const fragmentState : GPUFragmentState = {
            module: this.fragShaderModules[material.shaderType],
            entryPoint: material.shaderType,
            targets: [
                {
                    format: this.format
                }
            ]
        }

        return this.device.createRenderPipeline({
            layout: pipelineLayout,
            depthStencil: this.useDepthBuffer ? this.depthStencilState : undefined,
            multisample: this.useAntialiasing ? {count: this.sampleCount} : undefined,
            vertex: vertexState,
            fragment: fragmentState,
            primitive: {
                topology: "triangle-list",
                cullMode: cullMode
            },
        })

    }

    makeMaterialBindGroup(material : Material, sceneGlobals : SceneGlobalParameters) {

        const materialData : Float32Array = material.getMaterialData(sceneGlobals)

        const materialBuffer : GPUBuffer = this.device.createBuffer({
            size: materialData.byteLength,
            usage: GPUBufferUsage.UNIFORM,
            mappedAtCreation: true
        })

        new Float32Array(materialBuffer.getMappedRange()).set(materialData)
        materialBuffer.unmap()

        return this.device.createBindGroup({
            layout: this.materialGroupLayout,
            entries: [
                {
                    binding: 0,
                    resource: {
                        buffer: materialBuffer
                    }
                }
            ]
        })

    }

    renderMesh(mesh : Mesh, renderPass : GPURenderPassEncoder, objectsDrawn : number,
               sceneGlobals : SceneGlobalParameters) {

        const material : Material = mesh.material
        if (!material.visible) {
            return objectsDrawn
        }

        const bufferObject : BufferObject = mesh.geometry

        bufferObject.updateVertexData(this.device)
        const vertexBuffer : GPUBuffer = bufferObject.vertexBuffer
        const indexBuffer : GPUBuffer = bufferObject.indexBuffer

        let materialBindGroup : GPUBindGroup
        let pipeline : GPURenderPipeline

        const id : number = bufferObject.id
        const preprocessedPl : boolean = this.pipelines[id] !== undefined
        const preprocessedMat : boolean = this.materialBindGroups[material.shaderType] !== undefined

        const groupLayouts : GPUBindGroupLayout[] = [...this.bindGroupLayouts]

        // @ts-ignore
        if (!material.extendsNormalMaterial) {
            if (!preprocessedMat) {
                this.materialBindGroups[material.shaderType] = this.makeMaterialBindGroup(material, sceneGlobals)
            }
            if (!preprocessedPl) {
                groupLayouts.push(this.materialGroupLayout)
            }
            materialBindGroup = this.materialBindGroups[material.shaderType]
            renderPass.setBindGroup(2, materialBindGroup)
        }

        // @ts-ignore
        if (material.extendsTexturedMaterial && material.map?.initialized) {
            const texturedMaterial : TexturedMaterial = <TexturedMaterial>material
            if (!texturedMaterial.mapLoaded) {
                texturedMaterial.mapLoaded = true
                texturedMaterial.shaderType += "_texture"
            }
            if (!preprocessedPl) {
                groupLayouts.push(texturedMaterial.map.textureGroupLayout)
            }
            renderPass.setBindGroup(3, texturedMaterial.map.textureBindGroup)
        }

        if (!preprocessedPl) {
            pipeline = this.makePipeline(
                bufferObject.vertexLayout, bufferObject.cullMode, material, groupLayouts)
            this.pipelines[id] = pipeline
        }
        else {
            pipeline = this.pipelines[id]
        }

        renderPass.setPipeline(pipeline)
        renderPass.setVertexBuffer(0, vertexBuffer)

        if (bufferObject.indexData.length > 0) {
            renderPass.setIndexBuffer(indexBuffer, bufferObject.indexFormat)
            renderPass.drawIndexed(bufferObject.indexData.length, 1,
                0, 0, objectsDrawn)
        }
        else {
            renderPass.draw(bufferObject.instanceCount * 3, 1,
                0, objectsDrawn)
        }

        return 1

    }

    renderParentObject(parentObject : ParentObject, renderPass : GPURenderPassEncoder, objectsDrawn : number,
                       sceneGlobals : SceneGlobalParameters) {

        let childrenDrawn : number = 0

        parentObject.children.forEach((child : MainObject) => {
            // @ts-ignore
            if (child.extendsParentObject) {
                childrenDrawn += this.renderParentObject(<ParentObject>child, renderPass,
                    objectsDrawn + childrenDrawn, sceneGlobals)
            }
            // @ts-ignore
            else if (child.extendsMesh) {
                childrenDrawn += this.renderMesh(<Mesh>child, renderPass,
                    objectsDrawn + childrenDrawn, sceneGlobals)
            }
        })

        return childrenDrawn

    }

    render(scene : Scene) {

        scene.update()
        scene.camera.update()

        const projectionMatrix : mat4 = scene.camera.projectionMatrix
        const viewMatrix : mat4 = scene.camera.model

        const viewProjectionMatrix : mat4 = mat4.create()
        mat4.multiply(viewProjectionMatrix, projectionMatrix, viewMatrix)

        this.device.queue.writeBuffer(this.cameraUniformBuffer, 0, <ArrayBuffer>viewProjectionMatrix)

        const offset = scene.fillModelBuffers(this.modelBuffer, 0)

        this.device.queue.writeBuffer(this.objectModelBuffer, 0, this.modelBuffer, 0, offset)

        const wsCameraPosition : vec3 = scene.camera.getWorldPosition()
        this.device.queue.writeBuffer(this.wsCameraPositionUniformBuffer, 0, <ArrayBuffer>wsCameraPosition)

        scene.fillLightBuffer(this.lightSourceBuffer)

        const lightCountBuffer : Uint32Array = new Uint32Array(4)
        lightCountBuffer[0] = scene.lights.length

        this.device.queue.writeBuffer(this.lightBuffer, 0, lightCountBuffer)
        this.device.queue.writeBuffer(this.lightBuffer, 16, this.lightSourceBuffer)

        const sceneGlobals : SceneGlobalParameters = scene.getGlobalParameters()

        const textureView : GPUTextureView = this.context.getCurrentTexture().createView()
        let texture : GPUTexture

        if (this.useAntialiasing) {
            texture = this.device.createTexture({
                size: [this.canvas.width, this.canvas.height, 1],
                sampleCount: this.sampleCount,
                format: this.format,
                usage: GPUTextureUsage.RENDER_ATTACHMENT
            })
        }

        const colorAttachment : GPURenderPassColorAttachment = {
            view: this.useAntialiasing ? texture!.createView() : textureView,
            resolveTarget: this.useAntialiasing ? textureView : undefined,
            clearValue: { r: this.backgroundColor.r, g: this.backgroundColor.g, b: this.backgroundColor.b, a: 1.0 },
            loadOp: "clear",
            storeOp: "store"
        }

        const commandEncoder : GPUCommandEncoder = this.device.createCommandEncoder()
        const renderPass : GPURenderPassEncoder = commandEncoder.beginRenderPass({
            colorAttachments: [colorAttachment],
            depthStencilAttachment: this.useDepthBuffer ? this.depthStencilAttachment : undefined
        })

        renderPass.setBindGroup(0, this.frameBindGroup)
        renderPass.setBindGroup(1, this.lightBindGroup)

        const objectsDrawn : number = this.renderParentObject(scene, renderPass, 0, sceneGlobals)
        console.log("Objects drawn: " + objectsDrawn)

        renderPass.end()

        this.device.queue.submit([commandEncoder.finish()])

    }

    getDevice() : GPUDevice {
        return this.device
    }
}