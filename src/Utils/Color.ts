import { vec3 } from "gl-matrix"

export class Color {

    extendsColor : boolean = true
    type : string = "Color"

    r : number
    g : number
    b : number

    constructor(r : number = 1, g : number = 1, b : number = 1) {

        this.r = r
        this.g = g
        this.b = b

    }

    setColor(r : number, g : number, b : number) {
        this.r = r
        this.g = g
        this.b = b
    }

    setColorFromVec3(color : vec3) {
        this.r = color[0]
        this.g = color[1]
        this.b = color[2]
    }

    addColor(color : Color, intensity : number) {
        this.r += color.r * intensity
        this.g += color.g * intensity
        this.b += color.b * intensity
    }

    getVec3() : vec3 {
        return [this.r, this.g, this.b]
    }

    getVec3Intensity(intensity : number) : vec3 {
        return [this.r * intensity, this.g * intensity, this.b * intensity]
    }

}