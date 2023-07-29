import { Light } from "./Light"
import { Color } from "../Utils/Color"
import { vec3 } from "gl-matrix"
import { AttenuationType } from "../Utils/AttenuationType"
import { LightSource } from "../Utils/LightSource"

export class SpotLight extends Light {

    extendsSpotLight : boolean = true
    type : string = "SpotLight"

    direction : vec3
    attenuation : vec3
    attenuationType : AttenuationType
    range : number
    angle : number
    penumbra : number

    constructor(color : Color = new Color(), intensity : number = 1,
                direction : vec3 = [0, 0, 0], attenuation : vec3 = [1.0, 0.045, 0.0075],
                attenuationType : AttenuationType = AttenuationType.Quadratic,
                range : number = Infinity, angle : number = Math.PI / 3, penumbra : number = Math.PI / 6) {

        super(color, intensity)

        this.direction = direction
        this.attenuation = attenuation
        this.attenuationType = attenuationType
        this.range = range
        this.angle = angle
        this.penumbra = penumbra

    }

    getLightData() : LightSource {
        return {
            dir : this.direction,
            sourceType : 3,
            color : this.color.getVec3Intensity(this.intensity),
            angle : this.angle,
            pos : this.position,
            penumbra : this.penumbra,
            falloffFunc : this.attenuation,
            falloffType : this.attenuationType,
            range : this.range
        }
    }

}