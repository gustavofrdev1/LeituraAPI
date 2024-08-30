import * as data from "sqlite3";
export let dataBaseStatus = "not_ready"
const src = "db.sqlite"
const sql_def = `CREATE TABLE "Leituras" (
	"uuid" TEXT(20),
	"customer_code" INT(20),
	"measure_datetime" TEXT DEFAULT (datetime('now')),
    "measure_value" INT(20),
	"measure_type" TEXT(20),
	"has_confirmed" INT(20),
	"imageurl" TEXT(20)
);`
const db = new data.Database(src,(err)=>{
    if(err){
        console.log(err)
        return
    }
    console.log("trying to generate db.sqlite for the first time!")
    db.run(sql_def, (err)=>{
        if(err){
            if(String(err).includes("already exists")){
                console.log("Is not the first time generating database, db.sqlite already exists on project root. Skipping")
                dataBaseStatus="ready"
                return
            }
            console.log("An error occurred in database creation tool (database/sqlite.ts)"+err)
            return
        }
        console.log("Database generated with no errors!")
        dataBaseStatus="ready"
    })
})



export default db