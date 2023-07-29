import { Color } from "../Utils/Color"
import { SceneGlobalParameters } from "../Utils/SceneGlobalParameters"
import { TexturedMaterial } from "./TexturedMaterial"

export class SimpleMaterial extends TexturedMaterial {

    extendsSimpleMaterial : boolean = true
    type : string = "SimpleMaterial"

    shaderType : string = "fs_simple"

    emissive : Color

    constructor(emissive : Color = new Color(0, 0, 0)) {

        super()

        this.emissive = emissive

    }

    getMaterialData(sceneGlobals : SceneGlobalParameters) : Float32Array {
        const materialBuffer : Float32Array = new Float32Array(4)

        materialBuffer[0] = this.emissive.r
        materialBuffer[1] = this.emissive.g
        materialBuffer[2] = this.emissive.b
        materialBuffer[3] = 0

        return materialBuffer
    }

}