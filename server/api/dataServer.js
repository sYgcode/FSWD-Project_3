import { DB } from "../../database/db.js";
// example meeting
const meeting = {
    date : "...",
    startTime: "..",
    endTime: "...",
    owner: "username...",
    password: 32903 // MAKE SURE IT IS HASHED
}
export class DataServer {
    constructor(){
        const database = new DB("qwerty");
    }
}