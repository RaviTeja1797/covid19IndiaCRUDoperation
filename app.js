const express = require("express");
const expressAppInstance = express();
expressAppInstance.use(express.json());
const {open} = require("sqlite");
const sqlite3 = require("sqlite3")
const path = require("path")

const dbPath = path.join(__dirname, 'covid19India.db')
let databaseConnectionObject = null;

const initializeDBAndServer = async()=>{
    try{
        await open({
            filename:dbPath,
            driver:sqlite3.Database
        })

        expressAppInstance.listen(3000, ()=>{
            console.log('Server Initialized at http://localhost:3000/')
        })
    }catch(e){
        console.log(`Database Error ${e.message}`)
    }    
}

initializeDBAndServer();

