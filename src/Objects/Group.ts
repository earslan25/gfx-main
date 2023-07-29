import { MainObject } from "./MainObject"
import { ParentObject } from "./ParentObject"

export class Group extends ParentObject {

    extendsGroup : boolean = true
    type : string = "Group"

    constructor() {

        super()

    }

}