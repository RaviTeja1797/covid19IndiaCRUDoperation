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
    const getStatesQuery = `SELECT state_id as stateId, state_name as stateName, population FROM state`;
    try{
        let arrayOfStateObjects = await databaseConnectionObject.all(getStatesQuery)
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
    
    const getStateQuery = `SELECT state_id as stateId, state_name as stateName, population FROM state WHERE state_id = ${stateId}`
    try{
        const stateObject = await databaseConnectionObject.get(getStateQuery)
        response.send(stateObject)
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
    
    const getDistrictQuery = `SELECT district_id as districtId, district_name as districtName, state_id as stateId, cases, cured, active, deaths FROM district WHERE district_id = ${districtId}`
    try{
        const districtObject = await databaseConnectionObject.get(getDistrictQuery)
        response.send(districtObject)
    }catch(e){
        console.log(`Database Error ${e.message}`)
    }
    
})

//API-5 deleteDistrict

expressAppInstance.delete('/districts/:districtId', async(request, response)=>{
    let {districtId} = request.params;
    districtId = parseInt(districtId)

    const deleteDistrictQuery = `DELETE FROM district WHERE district_id = ${districtId}`

    try{
        await databaseConnectionObject.run(deleteDistrictQuery)
        response.send('District Removed')
    }catch(e){
        console.log(`Database Error ${e.message}`)
    }

})

//API-6 updateDistrict

expressAppInstance.put("/districts/:districtId", async(request, response)=>{
    let {districtId} = request.params;
    districtId = parseInt(districtId)

    let districtObject = request.body;

    const{districtName,stateId, cases, cured, active, deaths} = districtObject
    
    const updateDistrictQuery = `UPDATE district SET district_name = "${districtName}", state_id = ${stateId},
    cases = ${cases}, cured=${cured}, active = ${active}, deaths= ${deaths}
    WHERE district_id = ${districtId}`

    try{
        await databaseConnectionObject.run(updateDistrictQuery);
        response.send("District Details Updated");
    }catch(e){
        console.log(`Database Error ${e.message}`)
    }    
})

//API-7 getStats

expressAppInstance.get("/states/:stateId/stats", async(request, response)=>{
    let {stateId} = request.params;
    stateId = parseInt(stateId);

    const getStatsQuery = `SELECT SUM(cases) as totalCases, SUM(cured) as totalCured, SUM(active) as totalActive, SUM(deaths) as totalDeaths FROM district WHERE state_id = ${stateId}`
    try{
        const responseObject = await databaseConnectionObject.get(getStatsQuery);
        response.send(responseObject)   
    }catch(e){
        console.log(`Database Error ${e.message}`)
    }
    
})

//API-8 getStateNameByDistrictId

expressAppInstance.get('/districts/:districtId/details/', async(request, response)=>{
    let {districtId} = request.params;
    districtId = parseInt(districtId);

    const getStateNameByDistrictIdQuery = `SELECT state_name as stateName FROM state NATURAL JOIN district WHERE district_id=${districtId}`
    try{
        const stateNameObject = await databaseConnectionObject.all(getStateNameByDistrictIdQuery);
        response.send(stateNameObject[0])
    }catch(e){
        console.log(`Database Error ${e.message}`)
    }
})


module.exports = expressAppInstance;
