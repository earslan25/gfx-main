import { mat3, mat4, vec3 } from "gl-matrix"
import { ParentObject } from "./ParentObject"
import { Camera } from "../Cameras/Camera"

export abstract class MainObject {

    extendsMainObject : boolean = true
    type : string = "MainObject"

    parent : ParentObject | null

    position : vec3
    scale : vec3
    // will need 3x3 rotation matrix
    rotation : vec3
    up : vec3
    // target : vec3
    // rightVec : vec3
    model : mat4

    transformed : boolean

    protected constructor() {

        this.parent = null

        this.position = vec3.create()
        this.scale = [1, 1, 1]
        this.rotation = vec3.create()
        this.up = [0, 1, 0]
        // this.target = vec3.create()
        // this.rightVec = [1, 0, 0]
        this.model = mat4.create()
        this.transformed = true

    }

    rotateX(radians : number) {
        this.rotation[0] += radians
        this.rotation[0] %= Math.PI * 2
        this.transformed = true
    }

    rotateY(radians : number) {
        this.rotation[1] += radians
        this.rotation[1] %= Math.PI * 2
        this.transformed = true
    }

    rotateZ(radians : number) {
        this.rotation[2] += radians
        this.rotation[2] %= Math.PI * 2
        this.transformed = true
    }

    rotateXYZ(radians : vec3) {
        this.rotation[0] += radians[0]
        this.rotation[1] += radians[1]
        this.rotation[2] += radians[2]
        this.rotation[0] %= Math.PI * 2
        this.rotation[1] %= Math.PI * 2
        this.rotation[2] %= Math.PI * 2
        this.transformed = true
    }

    translateX(distance : number) {
        this.position[0] += distance
        this.transformed = true
    }

    translateY(distance : number) {
        this.position[1] += distance
        this.transformed = true
    }

    translateZ(distance : number) {
        this.position[2] += distance
        this.transformed = true
    }

    translateXYZ(distance : vec3) {
        this.position[0] += distance[0]
        this.position[1] += distance[1]
        this.position[2] += distance[2]
        this.transformed = true
    }

    scaleX(scale : number) {
        this.scale[0] *= scale
        this.transformed = true
    }

    scaleY(scale : number) {
        this.scale[1] *= scale
        this.transformed = true
    }

    scaleZ(scale : number) {
        this.scale[2] *= scale
        this.transformed = true
    }

    scaleXYZ(scale : vec3) {
        this.scale[0] *= scale[0]
        this.scale[1] *= scale[1]
        this.scale[2] *= scale[2]
        this.transformed = true
    }

    lookAt(target : vec3) {
        // @ts-ignore
        if (this.extendsCamera) {
            mat4.lookAt(this.model, this.position, target, this.up)
            // @ts-ignore
            this.target = target
        }
        else {
            mat4.lookAt(this.model, target, this.position, this.up)
        }
        this.transformed = true
    }

    applyMatrix(matrix : mat4) {
        mat4.mul(this.model, this.model, matrix)
        this.transformed = true
    }

    updateModel() {
        // vec3.cross(this.rightVec, this.target, [0, 1, 0])
        // vec3.cross(this.up, this.rightVec, this.target)

        if (this.transformed) {
            this.model = mat4.create()
            mat4.translate(this.model, this.model, this.position)
            mat4.rotateX(this.model, this.model, this.rotation[0])
            mat4.rotateY(this.model, this.model, this.rotation[1])
            mat4.rotateZ(this.model, this.model, this.rotation[2])
            mat4.scale(this.model, this.model, this.scale)
        }

        if (this.parent && this.parent.transformed) {
            mat4.mul(this.model, this.parent.model, this.model)
        }
    }

    updateVectorsFromModel() {
        if ((this.parent && this.parent.transformed) || this.transformed) {
            mat4.getTranslation(this.position, this.model)
            mat4.getScaling(this.scale, this.model)
            // mat4.getRotation(this.rotation, this.model)
        }
    }

    removeParent() {
        if (this.parent) {
            this.parent.removeChild(this)
        }
    }

    fillModelBuffers(buffer : Float32Array, offset : number) {
        if ((this.parent && this.parent.transformed) || this.transformed) {
            buffer.set(this.model, offset)

            // const model3 : mat3 = mat3.create()
            // mat3.fromMat4(model3, this.model)
            // mat3.invert(inverse, inverse)
            // mat3.transpose(inverse, inverse)
            // buffer3x3.set(model3, offset3x3)

            this.transformed = false
        }

        return 16
    }

    abstract update() : void

}