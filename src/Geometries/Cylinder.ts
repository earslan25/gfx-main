import { BufferObject } from "../Objects/BufferObject"
import {vec3} from "gl-matrix";

export class Cylinder extends BufferObject {

    extendsCylinder : boolean = true
    type : string = "Cylinder"

    topCap : boolean
    bottomCap : boolean

    topRadius : number
    bottomRadius : number
    height : number

    tessellationHeight : number
    tessellationRadial : number
    thetaStart : number
    thetaEnd : number

    constructor(topRadius : number = 1, bottomRadius : number = 1, height : number = 1,
                tessellationHeight : number = 1, tessellationRadial : number = 64,
                thetaStart : number = 0, thetaEnd : number = Math.PI * 2,
                topCap : boolean = true, bottomCap : boolean = true) {

        super()

        this.topCap = topCap
        this.bottomCap = bottomCap

        if (this.topCap && this.bottomCap) {
            this.cullMode = "back"
        }

        this.topRadius = topRadius
        this.bottomRadius = bottomRadius
        this.height = height

        this.tessellationHeight = tessellationHeight
        this.tessellationRadial = tessellationRadial
        this.thetaStart = thetaStart
        this.thetaEnd = thetaEnd

        this.generateSide()
        this.generateCaps()
        this.updateData()

    }

    generateSide() {
        const grid : number[][] = []
        let index : number = 0

        const halfHeight : number = this.height / 2
        const slope : number = (this.bottomRadius - this.topRadius) / this.height

        for (let j : number = 0; j <= this.tessellationHeight; j++) {
            const row : number[] = []

            const v : number = j / this.tessellationHeight
            const y : number = -v * this.height + halfHeight
            const radius : number = v * (this.bottomRadius - this.topRadius) + this.topRadius

            for (let i : number = 0; i <= this.tessellationRadial; i++) {
                const u : number = i / this.tessellationRadial
                const theta : number = u * (this.thetaEnd - this.thetaStart) + this.thetaStart
                const sinTheta : number = Math.sin(theta)
                const cosTheta : number = Math.cos(theta)

                const x : number = radius * sinTheta
                const z : number = radius * cosTheta

                const vert : vec3 = vec3.fromValues(x, y, z)
                const norm : vec3 = vec3.normalize(vec3.create(), [sinTheta, slope, cosTheta])
                this.addVertex3(vert)
                this.addNormal3(norm)
                this.addUV2([u, 1 - v])

                row.push(index)
                index++
            }

            grid.push(row)
        }

        for (let i : number = 0; i < this.tessellationRadial; i++) {
            for (let j : number = 0; j < this.tessellationHeight; j++) {
                const i1 : number = i + 1
                const j1 : number = j + 1

                const a : number = grid[j][i]
                const b : number = grid[j1][i]
                const c : number = grid[j1][i1]
                const d : number = grid[j][i1]

                this.addIndex([a, b, d, b, c, d])
            }
        }
    }

    generateCaps() {
        if (this.bottomCap && this.bottomRadius > 0) {
            this.generateCap(-1)
        }
        if (this.topCap && this.topRadius > 0) {
            this.generateCap(1)
        }
    }

    generateCap(sign : number) {
        let index : number = this.bufferData.position.length / 3
        const centerStart : number = index

        const radius : number = (sign === 1) ? this.topRadius : this.bottomRadius
        const halfHeight : number = this.height / 2
        const y : number = halfHeight * sign

        for (let i : number = 1; i <= this.tessellationRadial; i++) {
            this.addVertex3([0, y, 0])
            this.addNormal3([0, sign, 0])
            this.addUV2([0.5, 0.5])

            index++
        }

        const centerEnd : number = index

        for (let i : number = 0; i <= this.tessellationRadial; i++) {
            const u : number = i / this.tessellationRadial
            const theta : number = u * (this.thetaEnd - this.thetaStart) + this.thetaStart
            const cosTheta : number = Math.cos(theta)
            const sinTheta : number = Math.sin(theta)

            const x : number = radius * sinTheta
            const z : number = radius * cosTheta

            this.addVertex3([x, y, z])
            this.addNormal3([0, sign, 0])
            this.addUV2([cosTheta * 0.5 + 0.5, sinTheta * 0.5 * sign + 0.5])

            index++
        }

        for (let i : number = 0; i < this.tessellationRadial; i++) {
            const c : number = centerStart + i
            const x : number = centerEnd + i
            const x1 : number = x + 1

            if (sign === 1) {
                this.addIndex([x, x1, c])
            }
            else {
                this.addIndex([x1, x, c])
            }
        }
    }

}