
export abstract class Texture {

    extendsTexture : boolean = true
    type : string = "Texture"

    initialized : boolean = false

    format : GPUTextureFormat = "rgba8unorm"

    aspect : GPUTextureAspect = "all"
    baseMipLevel : number = 0
    mipLevelCount : number = 1
    baseArrayLayer : number = 0

    dimension! : GPUTextureViewDimension
    arrayLayerCount! : number

    mipmapFilter : GPUFilterMode = "nearest"

    addressModeU! : GPUAddressMode
    addressModeV! : GPUAddressMode
    magFilter! : GPUFilterMode
    minFilter! : GPUFilterMode
    maxAnisotropy! : number

    texture! : GPUTexture
    view! : GPUTextureView
    sampler! : GPUSampler
    textureBindGroup! : GPUBindGroup
    textureGroupLayout! : GPUBindGroupLayout

    constructor(addressModeU : GPUAddressMode = "repeat", addressModeV : GPUAddressMode = "repeat",
                magFilter : GPUFilterMode = "linear", minFilter : GPUFilterMode = "nearest",
                maxAnisotropy : number = 1) {

        this.addressModeU = addressModeU
        this.addressModeV = addressModeV
        this.magFilter = magFilter
        this.minFilter = minFilter
        this.maxAnisotropy = maxAnisotropy

    }

    // abstract loadTextureMap(path : string | string[]) : Promise<void>
    abstract loadTextureMap(path : string | string[], device : GPUDevice) : Promise<void>
    // abstract loadTextureMap(path : string | string[]) : void

    abstract loadImageBitmap(device : GPUDevice) : Promise<void>

    setupBindGroup(device : GPUDevice) {
        const viewDescriptor : GPUTextureViewDescriptor = this.createViewDescriptor()
        this.view = this.texture.createView(viewDescriptor)

        const samplerDescriptor : GPUSamplerDescriptor = this.createSamplerDescriptor()
        this.sampler = device.createSampler(samplerDescriptor)

        this.textureGroupLayout = device.createBindGroupLayout({
            entries: [
                {
                    binding: 0,
                    visibility: GPUShaderStage.FRAGMENT,
                    texture: {}
                },
                {
                    binding: 1,
                    visibility: GPUShaderStage.FRAGMENT,
                    sampler: {}
                }
            ],
        })

        this.textureBindGroup = device.createBindGroup({
            layout: this.textureGroupLayout,
            entries: [
                {
                    binding: 0,
                    resource: this.view
                },
                {
                    binding: 1,
                    resource: this.sampler
                }
            ]
        })
    }

    createViewDescriptor() : GPUTextureViewDescriptor {
        return {
            format: this.format,
            dimension: this.dimension,
            aspect: this.aspect,
            baseMipLevel: this.baseMipLevel,
            mipLevelCount: this.mipLevelCount,
            baseArrayLayer: this.baseArrayLayer,
            arrayLayerCount: this.arrayLayerCount
        }
    }

    createSamplerDescriptor() : GPUSamplerDescriptor {
        return {
            addressModeU: this.addressModeU,
            addressModeV: this.addressModeV,
            magFilter: this.magFilter,
            minFilter: this.minFilter,
            mipmapFilter: this.mipmapFilter,
            maxAnisotropy: this.maxAnisotropy,
        }
    }

}