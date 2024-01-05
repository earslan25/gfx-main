import { MainObject } from "./MainObject"

export abstract class ParentObject extends MainObject {

    extendsParentObject : boolean = true
    type : string = "ParentObject"

    children : MainObject[] = []
    meshCount : number = 0

    protected constructor() {

        super()

    }

    update() {
        if (this.transformed) {
            this.updateModel()
            this.updateVectorsFromModel()
        }
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
        // @ts-ignore
        if (child.extendsMesh) {
            this.meshCount++
        }
    }

    removeChild(child : MainObject) {
        child.parent = null
        this.children.splice(this.children.indexOf(child), 1)
    }

    fillModelBuffers(buffer : Float32Array, firstOffset : number) {
        let filled = 0
        this.children.forEach(child => {
            const offset = child.fillModelBuffers(buffer, firstOffset)

            firstOffset += offset
            filled += offset
        })

        this.transformed = false

        return filled
    }

}