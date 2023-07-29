import { vec3 } from "gl-matrix"
import { AttenuationType } from "./AttenuationType"

export interface LightSource {
    dir : vec3
    sourceType : number,
    color : vec3,
    angle : number,
    pos : vec3,
    penumbra : number
    falloffFunc : vec3
    falloffType : AttenuationType,
    range : number
}