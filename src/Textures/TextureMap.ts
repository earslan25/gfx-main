import { Texture } from "./Texture"

export class TextureMap extends Texture {

    extendsTextureMap : boolean = true
    type : string = "TextureMap"

    imageBitmap! : ImageBitmap

    constructor(addressModeU : GPUAddressMode = "repeat", addressModeV : GPUAddressMode = "repeat",
                magFilter : GPUFilterMode = "linear", minFilter : GPUFilterMode = "nearest",
                maxAnisotropy : number = 1) {

        super(addressModeU, addressModeV, magFilter, minFilter, maxAnisotropy)

        this.dimension = "2d"
        this.arrayLayerCount = 1

    }

     async loadTextureMap(imagePath : string, device : GPUDevice) {
        const response : Response = await fetch(imagePath)
        const blob : Blob = await response.blob()
        this.imageBitmap = await createImageBitmap(blob)

        await this.loadImageBitmap(device)

        await this.setupBindGroup(device)

        this.initialized = true
    }

    async loadImageBitmap(device : GPUDevice) {
        const textureDescriptor : GPUTextureDescriptor = {
            size: {
                width: this.imageBitmap.width,
                height: this.imageBitmap.height,
            },
            format: this.format,
            usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST | GPUTextureUsage.RENDER_ATTACHMENT
        }

        this.texture = device.createTexture(textureDescriptor)

        device.queue.copyExternalImageToTexture(
            { source: this.imageBitmap },
            { texture: this.texture },
            textureDescriptor.size
        )
    }

}