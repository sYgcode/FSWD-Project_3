import { DB } from "../../database/db.js";
import { Network } from "../../network/network.js";
// example meeting
const meeting = {
    title: "...", // the key (As in only one of each)
    date : "...",
    startTime: "..",
    endTime: "...",
} // make sure when you send the request the username and password(hashed are included in the body)
export class DataServer {
    constructor(net){ 
        this.database = new DB("$meetings$");
        this.net = net;
        this.userServer = "/users";
    }

    handleRequest(method, url, body, callback) {
        if (url === "/meetings" && method === "GET") {
            if(body)
                callback(this.getByKey(body));
            else
                callback(this.get());
        } else if (url === "/meetings" && method === "POST") {
            callback(this.post(body));
        } else if (url === "/meetings" && method === "PUT") {
            callback(this.put(body));
        } else if (url === "/meetings" && method === "DELETE") {
            callback(this.delete(body));
        }
        else {
            callback(this.genResponse(400, "Bad Request: Unsupported operation"));
        }
    }

    authenticated(body){
        let userResp =this.net.sendRequest("GET", this.userServer,{username: body.username}, (response) =>{return response;});
        userResp = JSON.parse(userResp);
        if(userResp.hasOwnProperty("status") && userResp.status == 200 && userResp.hasOwnProperty("data")){
            if(body.hasOwnProperty("username") && body.hasOwnProperty("password")){
                if(body.username == userResp.data.username && body.password == userResp.data.password)
                    return {flag: true, data: userResp.data};
            }
        }
        return {flag:false};
    }

    genResponse(status, message, data = null){
        if(data)
            return JSON.stringify({status: status, message: message, data: data});
        return JSON.stringify({status: status, message: message});
    }

    get(body){
        if(body.hasOwnProperty("username") && body.hasOwnProperty("password")){
            let returnData = [];
            let authData = this.authenticated(body);
            if(!authData.flag){
                return this.genResponse(403, "Forbidden: Authentication is invalid");
            }
            for(let meeting of authData.data.data){
                let temp = this.database.getByKey(body.username+meeting);
                if (temp && temp.hasOwnProperty("owner") && temp.owner==body.username){
                    returnData.push(temp);
                }
            }
            if(returnData)
                return this.genResponse(200, "Ok", {meetings: returnData});
            else
                return this.genResponse(404, "Not Found");            
        }
        return this.genResponse(400, "Bad Request: Missing information");
    }

    getByKey(body) {
        if(body.hasOwnProperty("username") && body.hasOwnProperty("password") && body.hasOwnProperty("title")){
            let authData = this.authenticated(body);
            if(!authData.flag){
                return this.genResponse(403, "Forbidden: Authentication is invalid");
            }
            if(userResp.data.includes(body.title)){
                returnData = database.getByKey(body.username + body.title);
                if(returnData && returnData.hasOwnProperty("owner") && returnData.owner==body.username)
                    return this.genResponse(200, "Ok", returnData);
            }
            return this.genResponse(404, "Not Found: Meeting was not found");
        }
        return this.genResponse(400, "Bad Request: Missing information");
    }

    post(body) {
        const properties = ["username", "password", "title", "date", "startTime", "endTime"];
        let allExist = properties.every(property => body.hasOwnProperty(property));
        if(allExist){
            let authData = this.authenticated(body);
            if(!authData.flag){
                return this.genResponse(403, "Forbidden: Authentication is invalid");
            }
            authData.data.data.push(title);
            let userResp1 = this.net.sendRequest("PUT", this.userServer, authData.data, (response) =>{return response;});
            userResp1 = JSON.parse(userResp1);
            if(userResp1.hasOwnProperty("status") && (userResp1.status == 200 || userResp1.status == 500)){
                let meeting = {title:body.title, date:body.date, startTime:body.startTime, endTime:body.endTime, owner:body.username}
                let success = this.database.add(body.username+body.title, meeting);
                if(success)
                    return this.genResponse(200, "Ok", meeting);
                else
                    return this.genResponse(409, "Conflict: Meeting already exists");
            }
            return(403, "Forbidden: Auth failed")
        }
        return this.genResponse(400, "Bad Request: Missing information");
    }

    put(body) {
        const properties = ["username", "password", "title", "date", "startTime", "endTime"];
        let allExist = properties.every(property => body.hasOwnProperty(property));
        if(allExist){
            let authData = this.authenticated(body);
            if(!authData.flag){
                return this.genResponse(403, "Forbidden: Authentication is invalid");
            }

            let meeting = {title:body.title, date:body.date, startTime:body.startTime, endTime:body.endTime, owner:body.username}
            let success = this.database.update(body.username+body.title, meeting);
            if(success)
                return this.genResponse(200, "Ok", meeting);
            else
                return this.genResponse(404, "Not Found: Meeting does not exist in DB");
        }
        return this.genResponse(400, "Bad Request: Missing information");
    }
    delete(body) {
        if(body.hasOwnProperty("title")){
            let authData = this.authenticated(body);
            if(!authData.flag){
                return this.genResponse(403, "Forbidden: Authentication is invalid");
            }
            for (let i in authData.data.data){
                if(authData.data.data[i] == body.title){
                    authData.data.data.splice(i, 1);
                    break;
                }
            }
            let userResp1 = this.net.sendRequest("PUT", this.userServer, authData.data, (response) =>{return response;});
            userResp1 = JSON.parse(userResp1);
            if(userResp1.hasOwnProperty("status") && (userResp1.status == 200 || userResp1.status == 500)){
                let success = this.database.delete(body.username+body.title);
                if(success)
                    return this.genResponse(200, "Ok");
                else
                    return this.genResponse(404, "Not Found: Meeting does not exist in DB");
            }
            return(403, "Forbidden: Auth failed")
        }
        return this.genResponse(400, "Bad Request: Missing information");
    }

}