import { mat4, vec2, vec3 } from "gl-matrix"


let _id : number = 0

export class BufferObject {

    extendsBufferObjects : boolean = true
    type : string = "BufferObject"
    id : number

    byteLength : number
    // for regular renderer
    vertexDescriptor : GPUBufferDescriptor
    vertexBuffer : GPUBuffer
    vertexLayout! : GPUVertexBufferLayout

    // for raytracer renderer
    triangleDescriptor : GPUBufferDescriptor
    triangleBuffer : GPUBuffer

    indexDescriptor : GPUBufferDescriptor
    indexBuffer : GPUBuffer

    stride : number = 4
    format3 : GPUVertexFormat = "float32x3"
    format2 : GPUVertexFormat = "float32x2"
    indexFormat : GPUIndexFormat = "uint16"

    updated : boolean
    instanceCount : number

    cullMode : GPUCullMode

    bufferData : {
        position : number[],
        itemSizePosition : number,
        normal : number[],
        itemSizeNormal : number,
        uv : number[]
        itemSizeUV : number
    } = {
        position: [],
        itemSizePosition: 3,
        normal: [],
        itemSizeNormal: 3,
        uv: [],
        itemSizeUV: 2
    }

    indexData : number[] = []

    constructor(cullMode : GPUCullMode = "none") {

        this.id = _id++

        this.byteLength = 0

        this.vertexDescriptor = {
            size: 0,
            usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
            mappedAtCreation: true
        }
        this.vertexBuffer = null!

        this.indexDescriptor = {
            size: 0,
            usage: GPUBufferUsage.INDEX | GPUBufferUsage.COPY_DST,
            mappedAtCreation: true
        }
        this.indexBuffer = null!

        this.triangleDescriptor = {
            size: 0,
            usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
            mappedAtCreation: true
        }
        this.triangleBuffer = null!

        this.updated = false

        this.instanceCount = 0

        this.cullMode = cullMode

    }

    addVertex3(position : vec3) {
        this.bufferData.position.push(position[0])
        this.bufferData.position.push(position[1])
        this.bufferData.position.push(position[2])
        this.updated = true
    }

    addNormal3(normal : vec3) {
        this.bufferData.normal.push(normal[0])
        this.bufferData.normal.push(normal[1])
        this.bufferData.normal.push(normal[2])
        this.updated = true
    }

    addUV2(uv : vec2) {
        this.bufferData.uv.push(uv[0])
        this.bufferData.uv.push(uv[1])
        this.updated = true
    }

    addCustomVertex(position : number[]) {
        for (let i : number = 0; i < position.length; i++) {
            this.bufferData.position.push(position[i])
        }
        this.updated = true
    }

    addCustomNormal(normal : number[]) {
        for (let i : number = 0; i < normal.length; i++) {
            this.bufferData.normal.push(normal[i])
        }
        this.updated = true
    }

    addCustomUV(uv : number[]) {
        for (let i : number = 0; i < uv.length; i++) {
            this.bufferData.uv.push(uv[i])
        }
        this.updated = true
    }

    addIndex(indices : number[]) {
        for (let i : number = 0; i < indices.length; i++) {
            this.indexData.push(indices[i])
        }
    }

    setByteLength(vertexLength : number, triangleLength : number) {
        const sizeCoeff : number = this.stride * this.instanceCount * 3
        const byteLength : number = vertexLength * sizeCoeff
        this.byteLength = byteLength
        this.vertexDescriptor.size = byteLength
        this.triangleDescriptor.size = triangleLength * sizeCoeff
        this.indexDescriptor.size = this.indexData.length * 2
        this.indexDescriptor.size += this.indexDescriptor.size % 4
    }

    setVertexLayout() {
        // metadata is partially used depending on the renderer, but this sets up everything
        let filledData : number = 0
        let triangleOffset : number = 0
        let location : number = 0
        const attributes : GPUVertexAttribute[] = []

        attributes.push({
            shaderLocation: location,
            format: this.format3,
            offset: 0
        })
        filledData += 3
        triangleOffset++
        location++

        attributes.push({
            shaderLocation: location,
            format: this.format3,
            offset: filledData * this.stride
        })
        filledData += 3
        triangleOffset++
        location++

        if (this.bufferData.normal.length == 0) {
            for (let i : number = 0; i < this.bufferData.position.length; i += 9) {
                const v0 : vec3 = vec3.fromValues(this.bufferData.position[i],
                    this.bufferData.position[i + 1], this.bufferData.position[i + 2])
                const v1 : vec3 = vec3.fromValues(this.bufferData.position[i + 3],
                    this.bufferData.position[i + 4], this.bufferData.position[i + 5])
                const v2 : vec3 = vec3.fromValues(this.bufferData.position[i + 6],
                    this.bufferData.position[i + 7], this.bufferData.position[i + 8])
                const normal : vec3 = vec3.create()
                vec3.cross(normal, vec3.sub(vec3.create(), v1, v0), vec3.sub(vec3.create(), v2, v0))
                vec3.normalize(normal, normal)
                this.addNormal3(normal)
                this.addNormal3(normal)
                this.addNormal3(normal)
            }
        }

        // not checking if uv is empty, if it is, it will be filled with 0
        // this is to avoid shader errors or multiple shaders for different objects
        // if (this.bufferData.uv.length > 0) {
        attributes.push({
            shaderLocation: location,
            format: this.format2,
            offset: filledData * this.stride
        })
        filledData += 2
        triangleOffset += 2
        // }

        this.vertexLayout = {
            arrayStride: filledData * this.stride,
            attributes: attributes
        }

        // based on float 32 stride
        this.setByteLength(filledData, triangleOffset)
    }

    updateData() {
        if (this.indexDescriptor.size == 0) {
            this.instanceCount = this.bufferData.position.length / 9
        }
        else {
            this.instanceCount = this.indexData.length / 3
        }

        this.setVertexLayout()
    }

    updateVertexData(device : GPUDevice, forceUpdate : boolean = false){
        if (this.updated || forceUpdate) {
            const prevByteLength : number = this.byteLength
            const prevIndexLength : number = this.indexDescriptor.size
            this.updateData()

            if (this.vertexBuffer == null || this.byteLength != prevByteLength) {
                this.vertexBuffer = device.createBuffer(this.vertexDescriptor)

                // delete triangle buffer if it exists
                if (this.triangleBuffer != null) {
                    this.triangleBuffer.destroy()
                    this.triangleBuffer = null!
                }
            }
            if (this.indexBuffer == null || this.indexDescriptor.size != prevIndexLength
                && this.indexDescriptor.size > 0) {
                this.indexBuffer = device.createBuffer(this.indexDescriptor)
            }

            const vertexArrayBuffer : ArrayBuffer = new ArrayBuffer(this.vertexDescriptor.size)
            const vertexFloat32Array : Float32Array = new Float32Array(vertexArrayBuffer)

            if (this.indexDescriptor.size > 0) {
                const indexArrayBuffer : ArrayBuffer = new ArrayBuffer(this.indexDescriptor.size)
                const indexUint16Array : Uint16Array = new Uint16Array(indexArrayBuffer)

                this.fillBuffer(vertexFloat32Array, indexUint16Array)

                new Uint16Array(this.indexBuffer.getMappedRange()).set(indexUint16Array)
                this.indexBuffer.unmap()
            }
            else {
                this.fillBuffer(vertexFloat32Array, null)
            }

            new Float32Array(this.vertexBuffer.getMappedRange()).set(vertexFloat32Array)
            this.vertexBuffer.unmap()

            this.updated = false
        }
    }

    fillBuffer(vertexBuffer : Float32Array, indexBuffer : Uint16Array | null) {
        let index : number = 0
        for (let i : number = 0; i < this.instanceCount * 3; i++) {
            vertexBuffer[index] = this.bufferData.position[i * 3]
            vertexBuffer[index + 1] = this.bufferData.position[i * 3 + 1]
            vertexBuffer[index + 2] = this.bufferData.position[i * 3 + 2]
            vertexBuffer[index + 3] = this.bufferData.normal[i * 3]
            vertexBuffer[index + 4] = this.bufferData.normal[i * 3 + 1]
            vertexBuffer[index + 5] = this.bufferData.normal[i * 3 + 2]
            if (this.bufferData.uv.length > 0) {
                vertexBuffer[index + 6] = this.bufferData.uv[i * 2]
                vertexBuffer[index + 7] = this.bufferData.uv[i * 2 + 1]
            }
            else {
                vertexBuffer[index + 6] = 0.0
                vertexBuffer[index + 7] = 0.0
            }
            index += 8
        }

        if (indexBuffer != null) {
            indexBuffer.set(this.indexData, 0)
        }
    }

    updateTriangleData(device : GPUDevice, forceUpdate : boolean = false) {
        if (this.updated || forceUpdate) {
            const prevTriangleLength : number = this.triangleDescriptor.size
            this.updateData()

            if (this.triangleBuffer == null || this.triangleDescriptor.size != prevTriangleLength) {
                this.triangleBuffer = device.createBuffer(this.triangleDescriptor)

                // delete vertex buffer if it exists
                if (this.vertexBuffer != null) {
                    this.vertexBuffer.destroy()
                    this.vertexBuffer = null!
                }

                // delete index buffer if it exists
                if (this.indexBuffer != null) {
                    this.indexBuffer.destroy()
                    this.indexBuffer = null!
                }
            }

            // does not draw with index buffer (nyi), this is only for raytracing
            // also, could reduce memory usage with better alignment,
            // but would require bad uv placements etc.
            const triangleArrayBuffer : ArrayBuffer = new ArrayBuffer(this.triangleDescriptor.size)
            const triangleFloat32Array : Float32Array = new Float32Array(triangleArrayBuffer)

            this.fillTriangleBuffer(triangleFloat32Array)

            new Float32Array(this.triangleBuffer.getMappedRange()).set(triangleFloat32Array)
            this.triangleBuffer.unmap()

            this.updated = false
        }
    }

    fillTriangleBuffer(triangleBuffer : Float32Array) {
        const getIndex = (this.indexDescriptor.size > 0) ?
            (index: number) => this.indexData[index] : (index: number) => index

        for (let i: number = 0; i < this.instanceCount; i++) {
            for (let j: number = 0; j < 3; j++) {
                const vertexIndex: number = getIndex(i * 3 + j)
                const vertexOffset: number = vertexIndex * 3
                const uvOffset: number = vertexIndex * 2

                // every 4 is alignment (3, 4 for uv)
                triangleBuffer[i * 36 + j * 12] = this.bufferData.position[vertexOffset]
                triangleBuffer[i * 36 + j * 12 + 1] = this.bufferData.position[vertexOffset + 1]
                triangleBuffer[i * 36 + j * 12 + 2] = this.bufferData.position[vertexOffset + 2]
                triangleBuffer[i * 36 + j * 12 + 3] = 0.0

                triangleBuffer[i * 36 + j * 12 + 4] = this.bufferData.normal[vertexOffset]
                triangleBuffer[i * 36 + j * 12 + 5] = this.bufferData.normal[vertexOffset + 1]
                triangleBuffer[i * 36 + j * 12 + 6] = this.bufferData.normal[vertexOffset + 2]
                triangleBuffer[i * 36 + j * 12 + 7] = 0.0

                triangleBuffer[i * 36 + j * 12 + 8] = this.bufferData.uv[uvOffset]
                triangleBuffer[i * 36 + j * 12 + 9] = this.bufferData.uv[uvOffset + 1]
                triangleBuffer[i * 36 + j * 12 + 10] = 0.0
                triangleBuffer[i * 36 + j * 12 + 11] = 0.0
            }
        }
    }

    applyMatrixVertex(matrix : mat4) {
        for (let i : number = 0; i < this.bufferData.position.length; i += this.bufferData.itemSizePosition) {
            const position : vec3 = vec3.fromValues(this.bufferData.position[i],
                this.bufferData.position[i + 1], this.bufferData.position[i + 2])
            vec3.transformMat4(position, position, matrix)
            this.bufferData.position[i] = position[0]
            this.bufferData.position[i + 1] = position[1]
            this.bufferData.position[i + 2] = position[2]
        }
    }

    applyMatrixNormal(matrix : mat4) {
        for (let i : number = 0; i < this.bufferData.normal.length; i += this.bufferData.itemSizeNormal) {
            const normal : vec3 = vec3.fromValues(this.bufferData.normal[i],
                this.bufferData.normal[i + 1], this.bufferData.normal[i + 2])
            vec3.transformMat4(normal, normal, matrix)
            this.bufferData.normal[i] = normal[0]
            this.bufferData.normal[i + 1] = normal[1]
            this.bufferData.normal[i + 2] = normal[2]
        }
    }

    applyMatrix(matrix : mat4) {
        this.applyMatrixVertex(matrix)
        this.applyMatrixNormal(matrix)
    }

    rotateX(angle : number) {
        const matrix : mat4 = mat4.create()
        mat4.rotateX(matrix, matrix, angle)
        this.applyMatrix(matrix)
    }

    rotateY(angle : number) {
        const matrix : mat4 = mat4.create()
        mat4.rotateY(matrix, matrix, angle)
        this.applyMatrix(matrix)
    }

    rotateZ(angle : number) {
        const matrix : mat4 = mat4.create()
        mat4.rotateZ(matrix, matrix, angle)
        this.applyMatrix(matrix)
    }

    rotateXYZ(angle : vec3) {
        const matrix : mat4 = mat4.create()
        mat4.rotateX(matrix, matrix, angle[0])
        mat4.rotateY(matrix, matrix, angle[1])
        mat4.rotateZ(matrix, matrix, angle[2])
        this.applyMatrix(matrix)
    }

    translateX(distance : number) {
        const matrix : mat4 = mat4.create()
        mat4.translate(matrix, matrix, vec3.fromValues(distance, 0, 0))
        this.applyMatrix(matrix)
    }

    translateY(distance : number) {
        const matrix : mat4 = mat4.create()
        mat4.translate(matrix, matrix, vec3.fromValues(0, distance, 0))
        this.applyMatrix(matrix)
    }

    translateZ(distance : number) {
        const matrix : mat4 = mat4.create()
        mat4.translate(matrix, matrix, vec3.fromValues(0, 0, distance))
        this.applyMatrix(matrix)
    }

    translateXYZ(distance : vec3) {
        const matrix : mat4 = mat4.create()
        mat4.translate(matrix, matrix, distance)
        this.applyMatrix(matrix)
    }

    scaleXYZ(scale : vec3) {
        const matrix : mat4 = mat4.create()
        mat4.scale(matrix, matrix, scale)
        this.applyMatrix(matrix)
    }

    lookAt(vector : vec3) {
        const matrix : mat4 = mat4.create()
        mat4.lookAt(matrix, vec3.fromValues(0, 0, 0), vector, vec3.fromValues(0, 1, 0))
        this.applyMatrix(matrix)
    }

    async loadObj(objPath : string) {
        this.bufferData.position = []
        this.bufferData.normal = []
        this.bufferData.uv = []
        this.indexData = []

        await this.loadObjData(objPath)

        // this.updateData()
    }

    async loadObjData(objPath : string) {
        const response : Response = await fetch(objPath)
        const blob : Blob = await response.blob()
        const file_contents : string = await blob.text()
        const lines : string[] = file_contents.split("\n")

        const vertices : vec3[] = []
        const uvs : vec2[] = []
        const normals : vec3[] = []

        lines.forEach((line : string) => {
            if (line[0] == "v" && line[1] == " ") {
                this.readObjVertex(line, vertices)
            }
            else if (line[0] == "v" && line[1] == "t") {
                this.readObjUv(line, uvs)
            }
            else if (line[0] == "v" && line[1] == "n") {
                this.readObjNormal(line, normals)
            }
            else if (line[0] == "f") {
                this.readObjFace(line, vertices, uvs, normals)
            }
        })

    }

    readObjVertex(line : string, vertices : vec3[]) {
        const tokens : string[] = line.split(" ")
        const v : vec3 = vec3.fromValues(parseFloat(tokens[1]), parseFloat(tokens[2]), parseFloat(tokens[3]))
        vertices.push(v)
    }

    readObjUv(line : string, uvs : vec2[]) {
        const tokens : string[] = line.split(" ")
        const vt : vec2 = vec2.fromValues(parseFloat(tokens[1]), parseFloat(tokens[2]))
        uvs.push(vt)
    }

    readObjNormal(line : string, normals : vec3[]) {
        const tokens : string[] = line.split(" ")
        const vn : vec3 = vec3.fromValues(parseFloat(tokens[1]), parseFloat(tokens[2]), parseFloat(tokens[3]))
        normals.push(vn)
    }

    readObjFace(line : string, vertices : vec3[], uvs : vec2[], normals : vec3[]) {
        line = line.replace("\n", "")
        const tokens : string[] = line.split(" ")

        const triangle_count : number = tokens.length - 3

        for (let i : number = 0; i < triangle_count; i++) {
            this.read_corner(tokens[1], vertices, uvs, normals)
            this.read_corner(tokens[2 + i], vertices, uvs, normals)
            this.read_corner(tokens[3 + i], vertices, uvs, normals)
        }
    }

    read_corner(vertex_description : string, vertices : vec3[], uvs : vec2[], normals : vec3[]) {
        const tokens : string[] = vertex_description.split("/")
        const vindex : number = parseInt(tokens[0]) - 1
        const vtindex : number = parseInt(tokens[1]) - 1
        const vnindex : number = parseInt(tokens[2]) - 1

        const v : vec3 = vertices[vindex]
        const vt : vec2 = uvs[vtindex]
        const vn : vec3 = normals[vnindex]

        this.addVertex3(v)
        this.addUV2(vt)
        this.addNormal3(vn)
    }

}