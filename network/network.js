import { UserServer } from "../server/api/userServer.js";
import { DataServer } from "../server/api/dataServer.js";

export class Network {
    static methods = ["GET", "POST", "PUT", "DELETE"];
    // constructor for our network. inits drop probability and delay times to simulate a real network
    constructor(dropProbability = 0.2, maxDelay=1000, minDelay=5) {
        this.dropProbability = dropProbability;
        this.maxDelay = maxDelay;
        this.minDelay = minDelay;

        // create instances of our servers
        this.userServer = new UserServer();
        this.dataServer = new DataServer();

        // list of servers
        this.servers = {"/users": this.userServer, "/meetings": this.dataServer};
    }

    sendRequest(method, url, body, callback) {
        // make sure the method being used exists
        if (!Network.methods.includes(method)) {
            console.log("Unknown method");
            callback(this.userServer.genResponse(400, "Bad Request: Unsupported operation"));
            return;
        }
        // Make sure we have the server listed in our network
        if (!this.servers.hasOwnProperty(url)){
            callback(this.userServer.genResponse(404, "Not Found: Unknown server"));
                return;
        }

        // Simulate packet loss
        if (Math.random() < this.dropProbability)
        {
            callback(this.userServer.genResponse(408, "Request Timeout: Packet lost"));
            return;
        }

        // Simulate random network delay
        let delay = Math.floor(Math.random() * (this.maxDelay - this.minDelay) + this.minDelay);
        setTimeout(() => {
            console.log(`Network: Delivering request to server after ${delay}ms`);
            
            // Pass response back to client through callback
            this.servers[url].handleRequest(method, url, body, (response) => {
                // Simulate response loss
                if (Math.random() < this.dropProbability) {
                    console.log("response dropped");
                    callback(this.userServer.genResponse(500, "Internal Server Error: Response lost"));
                    return;
                }
                callback(response);
            });

        }, delay);
    }
}

const net = new Network();
function cllbck(obj) {
    console.log(obj);
}
net.sendRequest("POST","/users",{username: "shua", password: "123", email:"example@example.com"}, cllbck);
net.sendRequest("GET","/users",{username: "shua"}, cllbck);