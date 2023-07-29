import { MainObject } from "./MainObject"
import { BufferObject } from "./BufferObject";
import { Material } from "../Materials/Material"

export class Mesh extends MainObject {

    extendsMesh : boolean = true
    type : string = "Mesh"

    geometry : BufferObject
    material : Material

    constructor(geometry : BufferObject = new BufferObject(), material : any) {

        super()

        this.geometry = geometry
        this.material = material

    }

    update() {
        this.updateModel()
        this.updateVectorsFromModel()
    }

}