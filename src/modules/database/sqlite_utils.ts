import { dataBaseStatus } from "./sqlite";
import { Database } from "sqlite3";
import fs from "fs";

const db = new Database("db.sqlite")
export function queryDatabase(query: string, params?: any[]): Promise<any | string> {
    console.log(query);
  
    if (dataBaseStatus === "not_ready") {
      console.error("Database is not ready yet!");
      return Promise.reject("Database not ready"); 
    }
  
    return new Promise((resolve, reject) => {
      db.all(query, params || [], (err, row) => {
        if (err) {
          console.error('Error executing query:', err);
          reject(`err_${err}`); 
        } else {
          resolve(row); 
        }
      });
    });
  }
export function on(){
    // placeholder ignition function
}
export function queryDatabase_getty(query: string, params?: any[]): Promise<any | string> {
    console.log(query);
  
    if (dataBaseStatus === "not_ready") {
      console.error("Database is not ready yet!");
      return Promise.reject("Database not ready"); 
    }
  
    return new Promise((resolve, reject) => {
      db.get(query, params || [], (err, row) => {
        if (err) {
          console.error('Error executing query:', err);
          reject(`err_${err}`); 
        } else {
          resolve(row); 
        }
      });
    });
  }
