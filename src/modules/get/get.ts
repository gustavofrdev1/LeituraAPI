import { queryDatabase } from "../database/sqlite_utils";
import * as dev from "./../utils"
interface measures_typeofs{
    [key: string]:string
}

export async function get(req: any, res: any ){
    let json_result = {}
    res.setHeader("Content-Type", "application/json");
    const customer_code = req.params.customer_code
    let filter = ((req.query.measure_type))|| false
    if(filter)filter=String(filter).toUpperCase()
    if (filter !== false && filter !== 'GAS' && filter !== 'WATER'){
        return dev.thrownError("INVALID_TYPE","",res)
    }
    if(!customer_code || isNaN(parseInt(customer_code))){
        return dev.thrownError("MEASURES_NOT_FOUND", "", res)
    }
    try{
        const measures = await queryDatabase("SELECT * FROM leituras WHERE customer_code = ?", [parseInt(customer_code)])
        let FILTERED_MEASURES:measures_typeofs={}
        if(filter){
            for (let [i, v] of Object.entries(measures)){
                const value:any = v
                console.log(1)
                console.log(value.measure_type, filter, value.measure_type==filter)
                if(value.measure_type !== filter){
                    delete measures[i]
                }
            }
        }
        const json_result = {
            "customer_code":customer_code,
            "measures":dev.cleanObject(measures)
        }
        res.status(200).json(json_result)
    }catch(err){//
        console.error("Error while querying measures from user: "+err)
    }
}