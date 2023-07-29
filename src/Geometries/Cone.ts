import { Cylinder } from "./Cylinder"

export class Cone extends Cylinder {

    extendsCone : boolean = true
    type : string = "Cone"

    constructor(radius : number = 1, height : number = 1,
                tessellationHeight : number = 1, tessellationRadial : number = 64,
                thetaStart : number = 0, thetaEnd : number = Math.PI * 2,
                bottomCap : boolean = true) {

        super(0, radius, height, tessellationHeight, tessellationRadial, thetaStart, thetaEnd, false, bottomCap)

        if (this.bottomCap) {
            this.cullMode = "back"
        }

    }

}