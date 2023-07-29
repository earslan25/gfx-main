import { Light } from "./Light"
import { Color } from "../Utils/Color"
import { LightSource } from "../Utils/LightSource"
import { AttenuationType } from "../Utils/AttenuationType"

export class AmbientLight extends Light {

    extendsAmbientLight : boolean = true
    type : string = "AmbientLight"

    constructor(color : Color = new Color(), intensity : number = 1) {

        super(color, intensity)

    }

    getLightData() : LightSource {
        return {
            dir : [0, 0, 0],
            sourceType : 0,
            color : this.color.getVec3Intensity(this.intensity),
            angle : 0,
            pos : [0, 0, 0],
            penumbra : 0,
            falloffFunc : [0, 0, 0],
            falloffType : AttenuationType.None,
            range : 0
        }
    }

}