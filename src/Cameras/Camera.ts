import { MainObject } from "../Objects/MainObject"
import {mat4, vec3} from "gl-matrix"

export abstract class Camera extends MainObject {

    extendsCamera : boolean = true
    type : string = "Camera"

    // needs target or forward vector, rotation does not work
    target : vec3

    // inverse view for camera
    inverseModelMatrix : mat4

    projectionMatrix : mat4
    inverseProjectionMatrix : mat4

    protected constructor() {

        super()

        this.target = vec3.create()

        this.inverseModelMatrix = mat4.create()

        this.projectionMatrix = mat4.create()
        this.inverseProjectionMatrix = mat4.create()

    }

    update() {
        this.updateModel()
        this.updateProjectionMatrix()
    }

    updateModel() {
        this.lookAt(this.target)
        mat4.invert(this.inverseModelMatrix, this.model)
    }

    setTarget(target : vec3) {
        this.target = target
    }

    getWorldPosition() : vec3 {
        let worldPosition : vec3 = vec3.create()
        vec3.transformMat4(worldPosition, this.position, this.inverseModelMatrix)
        return worldPosition
    }

    abstract updateProjectionMatrix() : void

}