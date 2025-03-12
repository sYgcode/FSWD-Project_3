// Fixed db.js with bug fixes
export class DB {
    // id of our database
    DBid = 0;
    idCounter = 0; // for each item in our db it will have a unique id
    DBData = []; // store the key of each item belonging to our db
    static savedWords = ["", "idCounter", "session"]; // keep track of savedwords for security reasons

    // constructor sets up our params and loads in our DBData
    constructor(DBid) {
        this.DBid = DBid;

        // Initialize DBData from localStorage, or an empty array if it doesn't exist
        const storedData = localStorage.getItem(DBid);
        if (storedData) {
            this.DBData = JSON.parse(storedData);
            const storedCounter = localStorage.getItem(DBid+"idCounter");
            this.idCounter = storedCounter ? JSON.parse(storedCounter) : 0;
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
            const storedItem = localStorage.getItem(this.DBid+entry);
            if (storedItem) {
                let obj = JSON.parse(storedItem);
                if (obj.DBid === this.DBid){
                    returnData.push(obj);
                }
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

        if(!this.doesExistInDB(key))
            return false;

        localStorage.removeItem(this.DBid+key);
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
        for(let entry of DB.savedWords){
            if(entry == key)
                return false;
        }

        if(!this.doesExistInDB(key))
            return false;

        const existingItem = localStorage.getItem(this.DBid+key);
        if (!existingItem)
            return false;

        const existingObj = JSON.parse(existingItem);
        obj.DBid = this.DBid;
        obj.DBitemID = existingObj.DBitemID;

        localStorage.setItem(this.DBid+key, JSON.stringify(obj));
        return true;
    }
}