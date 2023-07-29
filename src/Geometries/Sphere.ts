import { BufferObject } from "../Objects/BufferObject"
import { vec3 } from "gl-matrix"

export class Sphere extends BufferObject {

    extendsSphere : boolean = true
    type : string = "Sphere"

    radius : number

    tessellationWidth : number
    tessellationHeight : number
    phiStart : number
    phiEnd : number
    thetaStart : number
    thetaEnd : number

    constructor(radius : number = 1, tessellationWidth : number = 64, tessellationHeight : number = 32,
                phiStart : number = 0, phiEnd : number = Math.PI * 2,
                thetaStart : number = 0, thetaEnd : number = Math.PI) {

        super()

        this.cullMode = "back"

        this.radius = radius

        this.tessellationWidth = Math.max(3, tessellationWidth)
        this.tessellationHeight = Math.max(2, tessellationHeight)
        this.phiStart = phiStart
        this.phiEnd = phiEnd
        this.thetaStart = thetaStart
        this.thetaEnd = thetaEnd

        this.makeSphere()
        this.updateData()

    }

    makeSphere() {
        const grid : number[][] = []

        for (let j : number = 0; j <= this.tessellationHeight; j++) {
            const row : number[] = []

            const v : number = j / this.tessellationHeight

            const theta : number = v * (this.thetaEnd - this.thetaStart) + this.thetaStart
            const sinTheta : number = Math.sin(theta)
            const cosTheta : number = Math.cos(theta)

            for (let i : number = 0; i <= this.tessellationWidth; i++) {
                const u : number = i / this.tessellationWidth
                const phi : number = u * (this.phiEnd - this.phiStart) + this.phiStart
                const sinPhi : number = Math.sin(phi)
                const cosPhi : number = Math.cos(phi)

                const x : number = -this.radius * cosPhi * sinTheta
                const y : number = this.radius * cosTheta
                const z : number = this.radius * sinPhi * sinTheta

                const vert : vec3 = [x, y, z]
                const norm : vec3 = vec3.normalize(vec3.create(), vert)
                this.addVertex3(vert)
                this.addNormal3(norm)
                this.addUV2([u, 1 - v])

                row.push(this.bufferData.position.length / 3 - 1)
            }

            grid.push(row)
        }

        for (let j : number = 0; j < this.tessellationHeight; j++) {
            const j1 : number = j + 1

            for (let i : number = 0; i < this.tessellationWidth; i++) {
                const i1 : number = i + 1

                const a : number = grid[j][i1]
                const b : number = grid[j][i]
                const c : number = grid[j1][i]
                const d : number = grid[j1][i1]

                if (j !== 0 || this.thetaStart > 0) {
                    this.addIndex([a, b, d])
                }
                if (j !== this.tessellationHeight - 1 || this.thetaEnd < Math.PI) {
                    this.addIndex([b, c, d])
                }
            }
        }
    }
}