
import { Material } from "./Material"
import { SceneGlobalParameters } from "../Utils/SceneGlobalParameters"

export class NormalMaterial extends Material {

    extendsNormalMaterial : boolean = true
    type : string = "NormalMaterial"

    shaderType : string = "fs_normal"

    constructor() {

        super()

    }

    getMaterialData(sceneGlobals : SceneGlobalParameters) : Float32Array {
        return new Float32Array(0)
    }

}