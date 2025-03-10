import { DB } from "../../database/db.js";

// example user
const User = {
    username: "example",
    password: 3009094, // MAKE SURE THE VALUE PUT IN IS A HASH AND NOT THE REAL PASSWORD
    email: "example@example.com",
}
export class UserServer {
    constructor() {
        this.userDB = new DB("$users$");
    }

    handleRequest(method, url, body, callback) {
        if (url === "/users" && method === "GET") {
            if(body)
                callback(this.getByKey(body));
            else
                callback(this.get());
        } else if (url === "/users" && method === "POST") {
            callback(this.post(body));
        } else if (url === "/users" && method === "PUT") {
            callback(this.put(body));
        } else if (url === "/users" && method === "DELETE") {
            callback(this.delete(body));
        }
        else {
            callback(this.genResponse(400, "Bad Request: Unsupported operation"));
        }
    }

    genResponse(status, message, data = null){
        if(data)
            return JSON.stringify({status: status, message: message, data: data});
        return JSON.stringify({status: status, message: message});
    }

    get() {
        return this.genResponse(403, "Forbidden: Access to user list is not allowed");
    }

    getByKey(body) {
        if (body.hasOwnProperty("username")){
            let returnData = this.userDB.getByKey(body.username);
            if (!returnData)
                return this.genResponse(404, "Not Found: User does not exist in DB");
            return this.genResponse(200, "Ok", returnData);
            
        }
        return this.get();
    }

    post(body) {
        if (body.hasOwnProperty("username") && body.hasOwnProperty("password") && body.hasOwnProperty("email")){
            body["data"] = [];
            let success = this.userDB.add(body.username, body);
            if (!success)
                return this.genResponse(409, "Conflict: User already exists");
            return this.genResponse(200, "Ok");
            
        }
        return this.genResponse(400, "Bad Request: Information missing");
    }

    put(body) {
        if (body.hasOwnProperty("username") && body.hasOwnProperty("password") && body.hasOwnProperty("email")){
            let resp = this.getByKey(body.username);
            if(resp.status != 200)
                return this.genResponse(404, "Not Found: User does not exist in DB");
            body[data] = resp.data.data;
            let success = this.userDB.update(body.username, body);
            if (!success)
                return this.genResponse(404, "Not Found: User does not exist in DB");
            return this.genResponse(200, "Ok");
            
        }
        return this.genResponse(400, "Bad Request: Information missing");
    }

    delete (body) {
        if (body.hasOwnProperty("username")){
            let returnData = this.userDB.delete(body.username);
            if (!returnData)
                return this.genResponse(404, "Not Found: User does not exist in DB");
            return this.genResponse(200, "Ok");
            
        }
        return this.genResponse(400, "Bad Request: No key");
    }
}
