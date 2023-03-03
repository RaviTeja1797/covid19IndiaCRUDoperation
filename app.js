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
      databaseConnectionObject =  await open({
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

//API-1 getStates

expressAppInstance.get('/states/', async(request, response)=>{
    const getStatesQuery = `SELECT * FROM state`;
    try{
        let arrayOfStateObjects = await databaseConnectionObject.all(getStatesQuery)
        console.log(arrayOfStateObjects)
        arrayOfStateObjects = arrayOfStateObjects.map((eachObject)=>{
            let tempStateObject = {
                stateId : eachObject["state_id"],
                stateName: eachObject["state_name"],
                population: eachObject['population']
            }
            return tempStateObject
        })
        response.send(arrayOfStateObjects)

    }
    catch(e){
        console.log(`Database Error ${e.message}`)
    }
})

//API-2 getState

expressAppInstance.get("/states/:stateId", async(request, response)=>{
    let {stateId} = request.params;
    stateId = parseInt(stateId)
    
    const getStateQuery = `SELECT * FROM state WHERE state_id = ${stateId}`
    try{
        const stateObject = await databaseConnectionObject.get(getStateQuery)
        let tempStateObject = {
            stateId : stateObject['state_id'],
            stateName : stateObject['state_name'],
            population : stateObject['population'] 
        }
        response.send(tempStateObject)
    }catch(e){
        console.log(`Database Error ${e.message}`)
    }
    
    
})
    

//API - 3 createDistrict

expressAppInstance.post("/districts/", async(request, response)=>{
    const districtObject = request.body;
    const{districtName, stateId ,cases, cured, active,deaths} = districtObject
    
    const createDistrictQuery = `INSERT INTO district(district_name, state_id ,cases, cured, active,deaths)
    VALUES('${districtName}', ${stateId}, ${cases}, ${cured}, ${active}, ${deaths})`;

    try{
        await databaseConnectionObject.run(createDistrictQuery)
        response.send('District Successfully Added')
    }catch(e){
        console.log(`DataBase Error ${e.message}`)
    }
})
    

//API-4 getDistrict

expressAppInstance.get('/districts/:districtId', async(request, response)=>{
    let {districtId} = request.params;
    districtId = parseInt(districtId)
    
    const getDistrictQuery = `SELECT * FROM district WHERE district_id = ${districtId}`
    try{
        const districtObject = await databaseConnectionObject.get(getDistrictQuery)
        let tempDistrictObject = {
            districtId: districtObject["district_id"],
            districtName: districtObject['district_name'],
            stateId: districtObject["state_id"],
            cases: districtObject["cases"],
            cured: districtObject["cured"],
            active: districtObject["active"],
            deaths: districtObject.deaths
        }
        response.send(tempDistrictObject)
    }catch(e){
        console.log(`Database Error ${e.message}`)
    }
    
})

