// Fixed network.js with correct import path
import { Server } from "../server/server.js";

export class Network {
    // Constructor for our network. Inits drop probability and delay times to simulate a real network
    constructor(dropProbability = 0.2, maxDelay=1000, minDelay=5) {
        this.dropProbability = dropProbability;
        this.maxDelay = maxDelay;
        this.minDelay = minDelay;

        // Create instance of our server
        this.server = new Server();
    }

    sendRequest(method, url, body, callback) {
        // Simulate packet loss
        if (Math.random() < this.dropProbability) {
            callback(this.server.genResponse(408, "Request Timeout: Packet lost"));
            return;
        }

        // Simulate random network delay
        let delay = Math.floor(Math.random() * (this.maxDelay - this.minDelay) + this.minDelay);
        setTimeout(() => {
            console.log(`Network: Delivering request to server after ${delay}ms`);

            // Pass response back to client through callback
            this.server.handleRequest(method, url, body, (response) => {
                // Simulate response loss
                // if (Math.random() < this.dropProbability) {
                //     console.log("Response dropped");
                //     callback(this.server.genResponse(500, "Internal Server Error: Response lost"));
                //     return;
                // }
                callback(response);
            });
        }, delay);
    }
}