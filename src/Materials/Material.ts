import { Color } from "../Utils/Color"
import { SceneGlobalParameters } from "../Utils/SceneGlobalParameters"

export abstract class Material {

    extendsMaterial : boolean = true
    type : string = "Material"

    shaderType! : string

    opacity : number = 1
    visible : boolean = true

    constructor() {

    }

    abstract getMaterialData(sceneGlobals : SceneGlobalParameters) : Float32Array

}