import { Color } from "../Utils/Color"
import { vec3 } from "gl-matrix"
import { SceneGlobalParameters } from "../Utils/SceneGlobalParameters"
import { TexturedMaterial } from "./TexturedMaterial"

export class PhongMaterial extends TexturedMaterial {

    extendsPhongMaterial : boolean = true
    type : string = "PhongMaterial"

    shaderType : string = "fs_phong"

    diffuse : Color
    ambient : number
    specular : Color
    shininess : number

    // ior : number

    emissive : Color
    emissiveIntensity : number

    constructor(diffuse : Color = new Color(1, 1, 1), ambient: number = 1,
                specular : Color = new Color(1, 1, 1), shininess : number = 16,
                // indexOfRefraction : number = 1,
                emissive : Color = new Color(0, 0, 0), emissiveIntensity : number = 1) {

        super()

        this.diffuse = diffuse
        this.ambient = ambient
        this.specular = specular
        this.shininess = shininess

        // this.ior = indexOfRefraction

        this.emissive = emissive
        this.emissiveIntensity = emissiveIntensity

    }

    getMaterialData(sceneGlobals : SceneGlobalParameters) : Float32Array {
        const materialBuffer : Float32Array = new Float32Array(16)

        const cka : number = this.ambient * sceneGlobals.ka
        const ka : Color = new Color()
        ka.setColorFromVec3(sceneGlobals.ambientLightColor.getVec3Intensity(cka))

        const ckd : number = sceneGlobals.kd
        const kd : Color = new Color()
        kd.setColorFromVec3(this.diffuse.getVec3Intensity(ckd))

        const cks : number = sceneGlobals.ks
        const ks : Color = new Color()
        ks.setColorFromVec3(this.specular.getVec3Intensity(cks))

        const emissive : Color = new Color()
        emissive.setColorFromVec3(this.emissive.getVec3Intensity(this.emissiveIntensity))

        materialBuffer[0] = ka.r
        materialBuffer[1] = ka.g
        materialBuffer[2] = ka.b
        materialBuffer[3] = this.shininess
        materialBuffer[4] = ks.r
        materialBuffer[5] = ks.g
        materialBuffer[6] = ks.b
        materialBuffer[7] = 0
        materialBuffer[8] = kd.r
        materialBuffer[9] = kd.g
        materialBuffer[10] = kd.b
        materialBuffer[11] = 0
        materialBuffer[12] = emissive.r
        materialBuffer[13] = emissive.g
        materialBuffer[14] = emissive.b
        materialBuffer[15] = 0

        return materialBuffer
     }

}