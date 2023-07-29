import { BufferObject } from "./BufferObject"
import { vec2, vec3 } from "gl-matrix"

export abstract class PlaneBasedObject extends BufferObject {

    extendsPlaneBasedObject : boolean = true
    type : string = "PlaneBasedObject"

    constructor() {

        super()

    }

    buildPlane(axis1 : number, axis2 : number, axis3: number,
               udir : number, vdir : number,
               axis1len : number, axis2len : number, axis3len : number,
               tessWidth : number, tessHeight : number, vertexOffset : number) {

        const segmentWidth : number = axis1len / tessWidth
        const segmentHeight : number = axis2len / tessHeight

        const widthHalf : number = axis1len / 2
        const heightHalf : number = axis2len / 2
        const depthHalf : number = axis3len / 2

        for (let j : number = 0; j <= tessHeight; j++) {
            const y : number = vdir * (j * segmentHeight - heightHalf)

            for (let i : number = 0; i <= tessWidth; i++) {
                const x : number = udir * (i * segmentWidth - widthHalf)
                const z : number = depthHalf

                const vertex : vec3 = vec3.create()
                vertex[axis1] = x
                vertex[axis2] = y
                vertex[axis3] = z
                this.addVertex3(vertex)

                const normal : vec3 = vec3.create()
                normal[axis1] = 0
                normal[axis2] = 0
                normal[axis3] =  + (axis3len >= 0) - + (axis3len < 0)
                this.addNormal3(normal)

                this.addUV2([i / tessWidth, 1 - j / tessHeight])
            }
        }

        for (let j : number = 0; j < tessHeight; j++) {
            const iy1 : number = j + 1
            for (let i : number = 0; i < tessWidth; i++) {
                const tessX : number = tessWidth + 1
                const ix : number = i + vertexOffset
                const ix1 : number = ix + 1
                const iy1tessX : number = iy1 * tessX
                const iytessX : number = j * tessX

                const a : number = ix + iytessX
                const b : number = ix + iy1tessX
                const c : number = ix1 + iy1tessX
                const d : number = ix1 + iytessX

                this.addIndex([a, b, d, b, c, d])
            }
        }

    }

}