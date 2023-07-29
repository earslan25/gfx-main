import { PlaneBasedObject } from "../Objects/PlaneBasedObject"

export class Cube extends PlaneBasedObject {

    extendsCube : boolean = true
    type : string = "Cube"

    width : number
    height : number
    depth : number

    tessellationWidth : number
    tessellationHeight : number
    tessellationDepth : number

    constructor(width : number = 1, height : number = 1, depth : number = 1,
                tessellationWidth : number = 1, tessellationHeight : number = 1, tessellationDepth : number = 1) {

        super()

        this.cullMode = "back"

        this.width = width
        this.height = height
        this.depth = depth

        this.tessellationWidth = tessellationWidth
        this.tessellationHeight = tessellationHeight
        this.tessellationDepth = tessellationDepth

        let vertexOffset : number = 0

        this.buildPlane(2, 1, 0, -1, -1, depth, height, width,
            tessellationDepth, tessellationHeight, vertexOffset)
        const numberOfVertices : number = this.bufferData.position.length / 3
        vertexOffset += numberOfVertices

        this.buildPlane(2, 1, 0, 1, -1, depth, height, -width,
            tessellationDepth, tessellationHeight, vertexOffset)
        vertexOffset += numberOfVertices

        this.buildPlane(0, 2, 1, 1, 1, width, depth, height,
                        tessellationWidth, tessellationDepth, vertexOffset)
        vertexOffset += numberOfVertices

        this.buildPlane(0, 2, 1, 1, -1, width, depth, -height,
                        tessellationWidth, tessellationDepth, vertexOffset)
        vertexOffset += numberOfVertices

        this.buildPlane(0, 1, 2, 1, -1, width, height, depth,
                        tessellationWidth, tessellationHeight, vertexOffset)
        vertexOffset += numberOfVertices

        this.buildPlane(0, 1, 2, -1, -1, width, height, -depth,
                        tessellationWidth, tessellationHeight, vertexOffset)

        this.updateData()

    }

}