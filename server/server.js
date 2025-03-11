import { DB } from "../../database/db.js";

// example user
const User = {
    username: "example",
    password: 3009094, // MAKE SURE THE VALUE PUT IN IS A HASH AND NOT THE REAL PASSWORD
    email: "example@example.com"
} // when a user obj is returned it includes the data field which is a list of meeting titles that belong to him
// example meeting
const meeting = {
    title: "...", // the key (As in only one of each)
    date : "...",
    startTime: "..",
    endTime: "...",
} // make sure when you send the request the username and password(hashed are included in the body)

// class for an instance of our server
export class Server {
    // constructor. inits 2 databases
    constructor() {
        this.userDB = new DB("$users$");
        this.meetingDB = new DB("$meetings$");
    }

    // method to handle a request from the network, nd direct to the appropriate function
    handleRequest(method, url, body, callback) {
        body = JSON.parse(body);
        if(url=="/users"){
            if(method=="GET"){
                if(body)
                    callback(this.getUserByKey(body));
                else
                    callback(this.getUser());
            } else if(method=="POST"){
                callback(this.userPost(body));
            } else if(method=="PUT"){
                callback(this.userPut(body));
            } else if(method=="DELETE"){
                callback(this.UserDelete(body));
            } else {
                callback(this.genResponse(400, "Bad Request: Unsupported operation"));
            }
        } else if (url=="/meetings"){
            if(method=="GET"){
                if(body)
                    callback(this.meetingGet(body));
                else
                    callback(this.genResponse(400, "Bad Request: Missing information"));
            } else if(method=="POST"){
                callback(this.meetingPost(body));
            } else if(method=="PUT"){
                callback(this.meetingPut(body));
            } else if(method=="DELETE"){
                callback(this.meetingDelete(body));
            } else {
                callback(this.genResponse(400, "Bad Request: Unsupported operation"));
            }
        } else {
            callback(this.genResponse(400, "Bad Request: Unsupported operation"));
        }
    }

    // helper method to generate a response for the network callback
    genResponse(status, message, data = null){
        if(data)
            return JSON.stringify({status: status, message: message, data: data});
        return JSON.stringify({status: status, message: message});
    }

    // get request to the user db with no index
    getUser() {
        return this.genResponse(403, "Forbidden: Access to user list is not allowed");
    }

    // get request to the user db with an index
    getUserByKey(body) {
        // confirm the body of the request has the username and then retrieve the data
        if (body.hasOwnProperty("username")){
            let returnData = this.userDB.getByKey(body.username);
            if (!(body.hasOwnProperty("password") && returnData.password == body.password)){
                returnData = {username: returnData.username, password:body.password, email: returnData.email};
            } else {
                returnData = {username: returnData.username, password:body.password, email: returnData.email, data: returnData.data};
            }
            if (!returnData)
                return this.genResponse(404, "Not Found: User does not exist in DB");
            return this.genResponse(200, "Ok", returnData);
            
        }
        // return a 403 if the request is invalid
        return this.getUser();
    }

    // post request to the user db
    userPost(body) {
        // confirm the body of the request has the username, password, and email
        if (body.hasOwnProperty("username") && body.hasOwnProperty("password") && body.hasOwnProperty("email")){
            // create a new user object and make sure no extra data was included
            let newData = {username: body.username, password: body.password, email: body.email, data: []};
            // add the new user to the db
            let success = this.userDB.add(body.username, newData);
            if (!success)
                return this.genResponse(409, "Conflict: User already exists");
            return this.genResponse(200, "Ok");
        }
        return this.genResponse(400, "Bad Request: Missing required fields");
    }

    // put request to the user db
    userPut(body){
        console.log("sup2" + body);
        // confirm the body of the request has the username, password, and email
        if (body.hasOwnProperty("username") && body.hasOwnProperty("password") && body.hasOwnProperty("email")){
            let resp = JSON.parse(this.getUserByKey(body.username));
            if(resp.status != 200)
                return this.genResponse(404, "Not Found: User does not exist in DB");
            let newData;
            if(!body.hasOwnProperty("data")){
                newData = {username: body.username, password: body.password, email: body.email, data: resp.data.data};
                console.log("sup1" + body.data);
            }else{
                console.log("sup" + body.data);
                newData = {username: body.username, password: body.password, email: body.email, data: body.data};
            }
            // update the user in the db
            let success = this.userDB.update(body.username, newData);
            if (!success)
                return this.genResponse(404, "Not Found: User does not exist in DB");
            return this.genResponse(200, "Ok");
        }
        return this.genResponse(400, "Bad Request: Information missing");
    }

    // delete request to the user db
    UserDelete(body){
        if(body.hasOwnProperty("username")){
            let success = this.userDB.delete(body.username);
            if (!success)
                return this.genResponse(404, "Not Found: User does not exist in DB");
            return this.genResponse(200, "Ok");
        }
        return this.genResponse(400, "Bad Request: No key");
    }

    // method to authenticate a user
    authenticated(body) {
        if(!(body.hasOwnProperty("username") && body.hasOwnProperty("password"))){
            return {flag: false, data: null};
        }
        let userResp = JSON.parse(this.getUserByKey(body));
        if(userResp.status != 200)
            return {flag: false, data: null};
        if(userResp.data.password == body.password)
            return {flag: true, data: userResp.data};
        return {flag: false, data: null};
    }

    // get request to the meeting db with no index
    meetingGet(body) {
        // confirm the body of the request has the username and password
        if (!(body.hasOwnProperty("username") && body.hasOwnProperty("password"))){
            return this.genResponse(400, "Bad Request: Missing information");
        }
        // authenticate the user
        let authData = this.authenticated(body);
        if(!authData.flag){
            return this.genResponse(403, "Forbidden: Authentication is invalid");
        }
        // get the meetings for the user
        let returnData = [];
        authData.data.data.forEach(title => {
            let temp = this.meetingDB.getByKey(body.username + title);
            temp = {title: temp.title, date: temp.date, startTime: temp.startTime, endTime: temp.endTime}
            returnData.push(temp);
        });
        // return the meetings
        return this.genResponse(200, "Ok", {meetings: returnData});
    }

    // get request to the meeting db with an index
    meetingGetByKey(body) {
        // confirm the body of the request has the username, password, and title
        if (!(body.hasOwnProperty("username") && body.hasOwnProperty("password") && body.hasOwnProperty("title"))){
            return this.genResponse(400, "Bad Request: Missing information");
        }
        // authenticate the user
        let authData = this.authenticated(body);
        if(!authData.flag){
            return this.genResponse(403, "Forbidden: Authentication is invalid");
        }
        // confirm the user has the meeting
        if(authData.data.data.includes(body.title)){
            returnData = this.meetingDB.getByKey(body.username + body.title);
            if(returnData && returnData.hasOwnProperty("owner") && returnData.owner==body.username){
                let temp = {title: returnData.title, date: returnData.date, startTime: returnData.startTime, endTime: returnData.endTime}
                return this.genResponse(200, "Ok", temp);
            }
        }
        return this.genResponse(404, "Not Found");
    }

    // post request to the meeting db
    meetingPost(body) {
        const properties = ["username", "password", "title", "date", "startTime", "endTime"];
        let allExist = properties.every(property => body.hasOwnProperty(property));
        if(!allExist){
            return this.genResponse(400, "Bad Request: Missing information");
        }
        let authData = this.authenticated(body);
        if(!authData.flag){
            return this.genResponse(403, "Forbidden: Authentication is invalid");
        }
        if(authData.data.data.includes(body.title)){
            return this.genResponse(409, "Conflict: Meeting already exists");
        }
        let newMeeting = {title: body.title, date: body.date, startTime: body.startTime, endTime: body.endTime, owner: body.username};
        let success = this.meetingDB.add(body.username + body.title, newMeeting);
        if (!success)
            return this.genResponse(409, "Conflict: Meeting already exists");
        authData.data.data.push(body.title);
        console.log(authData.data.data);
        let userResp1 = this.userPut(authData);
        userResp1 = JSON.parse(userResp1);
        if(userResp1.hasOwnProperty("status") && (userResp1.status == 200 || userResp1.status == 500)){
            return this.genResponse(200, "Ok", newMeeting);
        }
        return this.genResponse(500, "Internal Server Error");
    }

    // put request to the meeting db
    meetingPut(body) {
        const properties = ["username", "password", "title", "date", "startTime", "endTime"];
        let allExist = properties.every(property => body.hasOwnProperty(property));
        if(!allExist){
            return this.genResponse(400, "Bad Request: Missing information");
        }
        let authData = this.authenticated(body);
        if(!authData.flag){
            return this.genResponse(403, "Forbidden: Authentication is invalid");
        }
        let meeting = {title: body.title, date: body.date, startTime: body.startTime, endTime: body.endTime, owner: body.username};
        let success = this.meetingDB.update(body.username + body.title, meeting);
        if (!success)
            return this.genResponse(404, "Not Found: Meeting does not exist");
        return this.genResponse(200, "Ok", meeting);
    }

    // delete request to the meeting db
    meetingDelete(body) {
        const properties = ["username", "password", "title"];
        let allExist = properties.every(property => body.hasOwnProperty(property));
        if(!allExist){
            return this.genResponse(400, "Bad Request: Missing information");
        }
        let authData = this.authenticated(body);
        if(!authData.flag){
            return this.genResponse(403, "Forbidden: Authentication is invalid");
        }
        if(authData.data.data.includes(body.title)){
            let success = this.meetingDB.delete(body.username + body.title);
            if (!success)
                return this.genResponse(404, "Not Found: Meeting does not exist");
            authData.data.data = authData.data.data.filter(title => title != body.title);
            let userResp1 = this.userPut(JauthData.data);
            userResp1 = JSON.parse(userResp1);
            if(userResp1.hasOwnProperty("status") && (userResp1.status == 200 || userResp1.status == 500)){
                return this.genResponse(200, "Ok");
            }
            return this.genResponse(500, "Internal Server Error");
        }
        return this.genResponse(404, "Not Found: Meeting does not exist");
    }
}