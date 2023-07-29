import { ParentObject } from "../Objects/ParentObject"
import { Camera } from "../Cameras/Camera"
import { ParallelViewCamera } from "../Cameras/ParallelViewCamera"
import { FrustumViewCamera } from "../Cameras/FrustumViewCamera"
import { Light } from "../Lights/Light"
import { AmbientLight } from "../Lights/AmbientLight"
import { Color } from "../Utils/Color"
import { MainObject } from "../Objects/MainObject"
import { SceneGlobalParameters } from "../Utils/SceneGlobalParameters"
import { LightSource } from "../Utils/LightSource"

export class Scene extends ParentObject {

    extendsScene : boolean = true
    type : string = "Scene"

    camera : Camera

    ambientLights : AmbientLight[] = []
    ambientLightColor : Color = new Color(0, 0, 0)

    lights : Light[] = []

    ka : number
    kd : number
    ks : number

    constructor(camera : Camera = new FrustumViewCamera(), ka : number = 1, kd : number = 1, ks : number = 1) {

        super()

        this.camera = camera

        this.ka = ka
        this.kd = kd
        this.ks = ks

    }

    addChild(child: MainObject) {
        // @ts-ignore
        if (child.extendsLight) {
            if (child.type == "AmbientLight") {
                this.addAmbientLight(<AmbientLight>child)
            }
            else {
                this.lights.push(<Light>child)
            }
        }
        else {
            super.addChild(child)
        }
    }

    addAmbientLight(ambientLight : AmbientLight) {
        this.ambientLights.push(ambientLight)
        this.ambientLightColor.addColor(ambientLight.color, ambientLight.intensity)
    }

    getGlobalParameters() : SceneGlobalParameters {
        return {
            ka : this.ka,
            ambientLightColor : this.ambientLightColor,
            kd : this.kd,
            ks : this.ks
        }
    }

    fillLightBuffer(lightBuffer : Float32Array) : void {
        let offset : number = 0
        this.lights.forEach(light => {
            const lightData : LightSource = light.getLightData()
            this.fillLightData(lightBuffer, offset, lightData)
            offset += 20
        })
    }

    fillLightData(lightBuffer : Float32Array, offset : number, lightData : LightSource) : void {
        lightBuffer[offset] = lightData.dir[0]
        lightBuffer[offset + 1] = lightData.dir[1]
        lightBuffer[offset + 2] = lightData.dir[2]
        lightBuffer[offset + 3] = lightData.sourceType
        lightBuffer[offset + 4] = lightData.color[0]
        lightBuffer[offset + 5] = lightData.color[1]
        lightBuffer[offset + 6] = lightData.color[2]
        lightBuffer[offset + 7] = lightData.angle
        lightBuffer[offset + 8] = lightData.pos[0]
        lightBuffer[offset + 9] = lightData.pos[1]
        lightBuffer[offset + 10] = lightData.pos[2]
        lightBuffer[offset + 11] = lightData.penumbra
        lightBuffer[offset + 12] = lightData.falloffFunc[0]
        lightBuffer[offset + 13] = lightData.falloffFunc[1]
        lightBuffer[offset + 14] = lightData.falloffFunc[2]
        lightBuffer[offset + 15] = lightData.falloffType
        lightBuffer[offset + 16] = lightData.range
        lightBuffer[offset + 17] = 0
        lightBuffer[offset + 18] = 0
        lightBuffer[offset + 19] = 0
    }

}