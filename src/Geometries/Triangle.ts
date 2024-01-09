import { BufferObject } from "../Objects/BufferObject"
import { vec2, vec3 } from "gl-matrix"

export class Triangle extends BufferObject {

    extendsTriangle : boolean = true
    type : string = "Triangle"

    vertices : vec3[]

    constructor(vertices : vec3[] = [[-0.5, -0.5, 0.0], [0.5, -0.5, 0.0], [0.0, 0.5, 0.0]]) {

        super()

        this.vertices = vertices

        this.addVertex3(vertices[0])
        this.addVertex3(vertices[1])
        this.addVertex3(vertices[2])

        const normal : vec3 = vec3.create()
        vec3.cross(normal, vec3.sub(vec3.create(), vertices[1], vertices[0]),
            vec3.sub(vec3.create(), vertices[2], vertices[0]))
        this.addNormal3(normal)
        this.addNormal3(normal)
        this.addNormal3(normal)

        this.addUV2([0.5, 0.0])
        this.addUV2([0.0, 1.0])
        this.addUV2([1.0, 1.0])

        this.addIndex([0, 1, 2])

        // this.updateData()

    }
}