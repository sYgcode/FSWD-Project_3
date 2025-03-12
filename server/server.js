// Fixed server.js with correct import path
import { DB } from "../database/db.js";

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
        if(url=="/login" && method=="POST"){
            callback(this.login(body));
        } else if(url=="/register" && method=="POST"){
            callback(this.register(body));
        } else if(url=="/logout" && method=="POST"){
            callback(this.logout(body));
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

    addSession(username){
        let newId = new Date();
        this.userDB.add(username + "session", {sessionID: newId});
        return newId;
    }

    removeSession(username){
        this.userDB.delete(username + "session");
    }

    register(body) {
        if(body.hasOwnProperty("username") && body.hasOwnProperty("password") && body.hasOwnProperty("email")){
            let newUser = {username: body.username, password: body.password, email: body.email, data: []};
            let success = this.userDB.add(body.username, newUser);
            if (!success)
                return this.genResponse(409, "Conflict: User already exists");
            let newId = this.addSession(body.username);
            return this.genResponse(200, "Ok", {sessionID: newId});
        }
        return this.genResponse(400, "Bad Request: Missing required fields");
    }


    login(body) {
        if(body.hasOwnProperty("username") && body.hasOwnProperty("password")){
            let userInfo = this.userDB.getByKey(body.username);
            if (!userInfo) {
                return this.genResponse(404, "Not Found: User does not exist");
            }

            if (body.username === userInfo.username && body.password == userInfo.password) {
                let newId = this.addSession(body.username);
                return this.genResponse(200, "Ok", {sessionID: newId});
            }
        }
        return this.genResponse(403, "Forbidden: Authentication is invalid");
    }

    logout(body) {
        if(body.hasOwnProperty("username") && body.hasOwnProperty("sessionID") && this.authenticate(body.username, body.sessionID)){
            this.removeSession(body.username);
            return this.genResponse(200, "Ok");
        }
        return this.genResponse(400, "Bad Request: Missing required fields");
    }

    // get request to the user db with an index
    getUserByKey(body) {
        // confirm the body of the request has the username and then retrieve the data
        if (body.hasOwnProperty("username")){
            let returnData = this.userDB.getByKey(body.username);
            if (!returnData)
                return this.genResponse(404, "Not Found: User does not exist in DB");

            if (!(body.hasOwnProperty("password") && returnData.password == body.password)){
                returnData = {username: returnData.username, email: returnData.email};
            } else {
                returnData = {username: returnData.username, password: returnData.password, email: returnData.email, data: returnData.data};
            }

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
        // confirm the body of the request has the username, password, and email
        if (body.hasOwnProperty("username") && body.hasOwnProperty("password") && body.hasOwnProperty("email")){
            const userInfo = this.userDB.getByKey(body.username);
            if(!userInfo)
                return this.genResponse(404, "Not Found: User does not exist in DB");

            let newData;
            if(!body.hasOwnProperty("data")){
                newData = {username: body.username, password: body.password, email: body.email, data: userInfo.data || []};
            } else {
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
    authenticate(username, sessionID) {
        const sessionData = this.userDB.getByKey(username + "session");
        if(sessionData && sessionData.sessionID == sessionID){
            return true;
        }
        return false;
    }

    // get request to the meeting db with no index
    meetingGet(body) {
        if(!(body.hasOwnProperty("sessionID") && body.hasOwnProperty("username") && this.authenticate(body.username, body.sessionID))){
            return this.genResponse(403, "Forbidden: Authentication is invalid");
        }

        // get user data
        const userData = this.userDB.getByKey(body.username);
        if(!userData){
            return this.genResponse(404, "Not Found: User not found");
        }

        // get the meetings for the user
        let returnData = [];
        if (userData.data && Array.isArray(userData.data)) {
            userData.data.forEach(title => {
                const meeting = this.meetingDB.getByKey(body.username + title);
                if (meeting) {
                    const temp = {
                        title: meeting.title,
                        date: meeting.date,
                        startTime: meeting.startTime,
                        endTime: meeting.endTime
                    };
                    returnData.push(temp);
                }
            });
        }

        // return the meetings
        return this.genResponse(200, "Ok", {meetings: returnData});
    }

    // get request to the meeting db with an index
    meetingGetByKey(body) {
        // authenticate the user
        if(!(body.hasOwnProperty("sessionID") && body.hasOwnProperty("username") && this.authenticate(body.username, body.sessionID))){
            return this.genResponse(403, "Forbidden: Authentication is invalid");
        }

        // get the user data
        const userData = this.userDB.getByKey(body.username);
        if(!userData){
            return this.genResponse(404, "Not Found: User not found");
        }

        if(!body.hasOwnProperty("title")){
            return this.genResponse(400, "Bad Request: Missing information");
        }

        // confirm the user has the meeting
        if(userData.data && userData.data.includes(body.title)){
            const meeting = this.meetingDB.getByKey(body.username + body.title);
            if(meeting && meeting.owner === body.username){
                const temp = {
                    title: meeting.title,
                    date: meeting.date,
                    startTime: meeting.startTime,
                    endTime: meeting.endTime
                };
                return this.genResponse(200, "Ok", temp);
            }
        }
        return this.genResponse(404, "Not Found: Meeting not found");
    }

    // post request to the meeting db
    meetingPost(body) {
        if(!(body.hasOwnProperty("sessionID") && body.hasOwnProperty("username") && this.authenticate(body.username, body.sessionID))){
            return this.genResponse(403, "Forbidden: Authentication is invalid");
        }

        const properties = ["username", "title", "date", "startTime", "endTime"];
        let allExist = properties.every(property => body.hasOwnProperty(property));
        if(!allExist){
            return this.genResponse(400, "Bad Request: Missing information");
        }

        const userData = this.userDB.getByKey(body.username);
        if(!userData) {
            return this.genResponse(404, "Not Found: User not found");
        }

        if(!userData.data) {
            userData.data = [];
        }

        if(userData.data.includes(body.title)){
            return this.genResponse(409, "Conflict: Meeting already exists");
        }

        const newMeeting = {
            title: body.title,
            date: body.date,
            startTime: body.startTime,
            endTime: body.endTime,
            owner: body.username
        };

        const success = this.meetingDB.add(body.username + body.title, newMeeting);
        if (!success)
            return this.genResponse(409, "Conflict: Meeting already exists");

        userData.data.push(body.title);

        const updateSuccess = this.userDB.update(body.username, userData);
        if (!updateSuccess) {
            this.meetingDB.delete(body.username + body.title);
            return this.genResponse(500, "Internal Server Error: Failed to update user data");
        }

        return this.genResponse(200, "Ok", newMeeting);
    }

    // put request to the meeting db
    meetingPut(body) {
        if(!(body.hasOwnProperty("sessionID") && body.hasOwnProperty("username") && this.authenticate(body.username, body.sessionID))){
            return this.genResponse(403, "Forbidden: Authentication is invalid");
        }

        const properties = ["username", "title", "date", "startTime", "endTime"];
        let allExist = properties.every(property => body.hasOwnProperty(property));
        if(!allExist){
            return this.genResponse(400, "Bad Request: Missing information");
        }

        const meeting = {
            title: body.title,
            date: body.date,
            startTime: body.startTime,
            endTime: body.endTime,
            owner: body.username
        };

        const success = this.meetingDB.update(body.username + body.title, meeting);
        if (!success)
            return this.genResponse(404, "Not Found: Meeting does not exist");

        return this.genResponse(200, "Ok", meeting);
    }

    // delete request to the meeting db
    meetingDelete(body) {
        if(!(body.hasOwnProperty("sessionID") && body.hasOwnProperty("username") && this.authenticate(body.username, body.sessionID))){
            return this.genResponse(403, "Forbidden: Authentication is invalid");
        }

        const properties = ["username", "title"];
        let allExist = properties.every(property => body.hasOwnProperty(property));
        if(!allExist){
            return this.genResponse(400, "Bad Request: Missing information");
        }

        const userData = this.userDB.getByKey(body.username);
        if(!userData) {
            return this.genResponse(404, "Not Found: User not found");
        }

        if(!userData.data || !userData.data.includes(body.title)) {
            return this.genResponse(404, "Not Found: Meeting does not exist");
        }

        const deleteSuccess = this.meetingDB.delete(body.username + body.title);
        if (!deleteSuccess)
            return this.genResponse(404, "Not Found: Meeting does not exist in database");

        userData.data = userData.data.filter(title => title !== body.title);
        const updateSuccess = this.userDB.update(body.username, userData);
        if (!updateSuccess) {
            return this.genResponse(500, "Internal Server Error: Failed to update user data");
        }

        return this.genResponse(200, "Ok");
    }
}