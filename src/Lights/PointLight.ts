import { Light } from "./Light"
import { Color } from "../Utils/Color"
import { vec3 } from "gl-matrix"
import { AttenuationType } from "../Utils/AttenuationType"
import { LightSource } from "../Utils/LightSource"

export class PointLight extends Light {

    extendsPointLight : boolean = true
    type : string = "PointLight"

    attenuation : vec3
    attenuationType : AttenuationType
    range : number

    constructor(color : Color = new Color(), intensity : number = 1, attenuation : vec3 = [1.0, 0.045, 0.0075],
                attenuationType : AttenuationType = AttenuationType.Quadratic, range : number = Infinity) {

        super(color, intensity)

        this.attenuation = attenuation
        this.attenuationType = attenuationType
        this.range = range

    }

    getLightData() : LightSource {
        return {
            dir : [0, 0, 0],
            sourceType : 2,
            color : this.color.getVec3Intensity(this.intensity),
            angle : 0,
            pos : this.position,
            penumbra : 0,
            falloffFunc : this.attenuation,
            falloffType : this.attenuationType,
            range : this.range
        }
    }

}