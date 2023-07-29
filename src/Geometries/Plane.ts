import { PlaneBasedObject } from "../Objects/PlaneBasedObject"

export class Plane extends PlaneBasedObject {

    extendsPlane : boolean = true
    type : string = "Plane"

    width : number
    height : number

    tessellationWidth : number
    tessellationHeight : number

    constructor(width : number = 1, height : number = 1,
                tessellationWidth : number = 1, tessellationHeight : number = 1) {

        super()

        this.width = width
        this.height = height

        this.tessellationWidth = tessellationWidth
        this.tessellationHeight = tessellationHeight

        this.buildPlane(0, 1, 2, 1, -1, width, height, 0,
                        tessellationWidth, tessellationHeight, 0)
        this.updateData()

    }

}