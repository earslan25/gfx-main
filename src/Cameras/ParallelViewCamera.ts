import { Camera } from "./Camera"
import { mat4 } from "gl-matrix"

export class ParallelViewCamera extends Camera {

    extendsParallelViewCamera : boolean = true
    type : string = "ParallelViewCamera"

    left : number
    right : number
    bottom : number
    top : number
    near : number
    far : number

    constructor(left : number = -1, right : number = 1, bottom : number = -1, top : number = 1,
                near : number = 0.1, far : number = 100) {

        super()

        this.left = left
        this.right = right
        this.bottom = bottom
        this.top = top
        this.near = near
        this.far = far

        this.updateProjectionMatrix()

    }

    updateProjectionMatrix() {
        mat4.ortho(this.projectionMatrix, this.left, this.right, this.bottom, this.top, 0.1, 10)
        mat4.invert(this.inverseProjectionMatrix, this.projectionMatrix)
    }

    setViewport(left : number, right : number, bottom : number, top : number) {
        this.left = left
        this.right = right
        this.bottom = bottom
        this.top = top
        this.updateProjectionMatrix()
    }

}