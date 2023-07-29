import { Material } from "./Material"
import { Texture } from "../Textures/Texture"

export abstract class TexturedMaterial extends Material {

    extendsTexturedMaterial : boolean = true
    type : string = "TexturedMaterial"

    map! : Texture
    mapLoaded : boolean = false

    constructor() {

        super()

    }

    setTexture(texture : Texture) {
        this.map = texture
    }

}