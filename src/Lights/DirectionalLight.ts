import { Light } from "./Light"
import { Color } from "../Utils/Color"
import { vec3 } from "gl-matrix"
import { LightSource } from "../Utils/LightSource"
import { AttenuationType } from "../Utils/AttenuationType"

export class DirectionalLight extends Light {

    extendsDirectionalLight : boolean = true
    type : string = "DirectionalLight"

    direction : vec3

    constructor(color : Color = new Color(), intensity : number = 1,
                direction : vec3 = [0, 0, 0]) {

        super(color, intensity)

        this.direction = direction

    }

    getLightData(): LightSource {
        return {
            dir : this.direction,
            sourceType : 1,
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