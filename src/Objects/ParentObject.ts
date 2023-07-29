import { MainObject } from "./MainObject"

export abstract class ParentObject extends MainObject {

    extendsParentObject : boolean = true
    type : string = "ParentObject"

    children : MainObject[] = []
    meshCount : number = 0

    constructor() {

        super()

    }

    update() {
        this.updateModel()
        this.updateVectorsFromModel()

        this.children.forEach(child => {
            child.update()
        })
    }

    addChild(child : MainObject) {
        if (child.parent) {
            child.parent.removeChild(child)
        }
        child.parent = this
        this.children.push(child)
        if (child.type == "Mesh") {
            this.meshCount++
        }
    }

    removeChild(child : MainObject) {
        child.parent = null
        this.children.splice(this.children.indexOf(child), 1)
    }

    fillModelBuffers(buffer : Float32Array, firstOffset : number,
                    buffer3x3 : Float32Array, offset3x3 : number) {

        this.children.forEach(child => {
            const {
                offset,
                offset3
            } = child.fillModelBuffers(buffer, firstOffset, buffer3x3, offset3x3)

            firstOffset += offset
            offset3x3 += offset3
        })

        return { offset: firstOffset, offset3: offset3x3 }
    }

}