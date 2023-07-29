import { Camera } from "./Camera"
import { mat4, vec3 } from "gl-matrix"

export class FrustumViewCamera extends Camera {

    extendsFrustumViewCamera : boolean = true
    type : string = "FrustumViewCamera"

    fov : number
    aspect : number
    near : number
    far : number

    constructor(fov : number = 45, aspect : number = 1, near : number = 0.1, far : number = 100) {

        super()

        this.fov = fov
        this.aspect = aspect
        this.near = near
        this.far = far

        this.updateProjectionMatrix()

    }

    updateProjectionMatrix() {
        const tangent : number = Math.tan(this.fov / 2)
        const fn : number = this.far - this.near
        this.projectionMatrix[0] = 1 / (this.aspect * tangent)
        this.projectionMatrix[5] = 1 / tangent
        this.projectionMatrix[10] = -(this.far + this.near) / fn
        this.projectionMatrix[11] = -1
        this.projectionMatrix[14] = -(2 * this.far * this.near) / fn
        this.projectionMatrix[15] = 0

        mat4.invert(this.inverseProjectionMatrix, this.projectionMatrix)
    }

}