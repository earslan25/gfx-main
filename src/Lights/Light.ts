import { Color } from "../Utils/Color"
import { MainObject } from "../Objects/MainObject"
import { LightSource } from "../Utils/LightSource"

export abstract class Light extends MainObject {

    extendsLight : boolean = true
    type : string = "Light"

    color : Color
    intensity : number

    constructor(color : Color = new Color(), intensity : number = 1) {

        super()

        this.color = color
        this.intensity = intensity

    }

    update() {
        // this.updateModel()
        // light model is not used yet, no lookAt
    }

    abstract getLightData() : LightSource

}