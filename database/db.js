export class DB {
    // id of our database
    DBid = 0;
    idCounter = 0; // for each item in our db it will have a unique id 
    DBData = []; // store the key of each item belonging to our db
    static savedWords = ["", "idCounter"]; // keep track of savedwords for security reasons

    // constructor sets up our params and loads in our DBData
    constructor(DBid) {
        this.DBid = DBid;

        // Initialize DBData from localStorage, or an empty array if it doesn't exist
        const storedData = localStorage.getItem(DBid);
        if (storedData) {
            this.DBData = JSON.parse(storedData);
            this.idCounter = JSON.parse(localStorage.getItem(DBid+"idCounter"));
        } else {
            this.DBData = [];
            localStorage.setItem(DBid, JSON.stringify(this.DBData));
            localStorage.setItem(DBid+"idCounter", this.idCounter);
        }
    }

    // get all items belonging to a database
    get() {
        let returnData = [];
        for (let entry of this.DBData) {
            let obj = JSON.parse(localStorage.getItem(this.DBid+entry));
            if (obj.DBid === this.DBid){
                returnData += obj;
            }
        }

        return returnData;
    }

    // get a specific item by key belonging to a database
    getByKey(key){
        const obj = localStorage.getItem(this.DBid+key);
        if (obj)
            return JSON.parse(obj);
        return false;
    }

    // helper function on if something exists in our database
    doesExistInDB(key) {
        for (let entry of this.DBData){
            console.log(entry);
            if (entry == key)
                return true;
        }

        return false;
    }

    // add an item to our db. include a field identifying the DB and a special id for the item
    add(key, obj){
        for(let entry of DB.savedWords){
            if(entry == key)
                return false;
        }
        if (this.doesExistInDB(key) || key == this.DBid){
            console.log("exists");
            return false;
        }
        obj.DBid = this.DBid;
        obj.DBitemID = ++this.idCounter;
        localStorage.setItem(this.DBid+"idCounter", this.idCounter);
        localStorage.setItem(this.DBid+key, JSON.stringify(obj));
        this.DBData.push(key);
        localStorage.setItem(this.DBid, JSON.stringify(this.DBData));
        return true;
    }

    // delete a key from the array
    delete(key){
        for(let entry of DB.savedWords){
            if(entry == key)
                return false;
        }
        if(!this.doesExistInDB)
            return false;
        localStorage.removeItem(this.DBid+key)
        for (let i in this.DBData){
            if(this.DBData[i] == key){
                this.DBData.splice(i, 1);
                localStorage.setItem(this.DBid, JSON.stringify(this.DBData));
                break;
            }
        }
        return true;
    }

    // update a key to be equal to a new obj
    update(key, obj) {
        for(let entry of this.savedWords){
            if(entry == key)
                return false;
        }
        if(!this.doesExistInDB)
            return false;
        obj.DBitemID = JSON.parse(localStorage.getItem(this.DBid+key)).DBitemID;
        localStorage.setItem(this.DBid+key, JSON.stringify(obj));
        return true;
    }
}


