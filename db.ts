import sqlite3 from "sqlite3";
import { network } from "./network";

const sqlite = sqlite3.verbose();

const db = new sqlite.Database('Database.db', (err)=>{
    if(err){
        console.log(err)
        process.exit(1);
    }
    else{
        console.log("CONNECTED TO DB")
    }
})
const dbName = 'runtime'

const toPromise = (fn: string, statement: string) => {
    return function (option: any[]){
        return new Promise((resolve, reject) => {
            db[fn](statement, option, function(err: any, result: any) {
                if(err){
                    reject(err);
                }
                else resolve({this: this, result});
            })
        })
    }
}

db.run(`CREATE TABLE IF NOT EXISTS ${dbName} (id INTEGER PRIMARY KEY, user INTEGER, start INTEGER, stop INTEGER)`);

const sqlCreate = toPromise('run', `INSERT INTO ${dbName}(user, start, stop) VALUES (?, ?, ?)`);
const sqlUpdate = toPromise('run', `UPDATE ${dbName} SET stop=?`);
const sqlSelect = toPromise('all', `SELECT * FROM ${dbName} WHERE user=? ORDER BY start DESC LIMIT ? OFFSET ? `);
const sqlDelete = toPromise('run', `DELETE FROM ${dbName} WHERE start < ?`);

export const createEntry = async (user_id: number, start: number, end: number) => {
    const res:any = await sqlCreate([user_id, start, end]);
    console.log(res.this)
}

export const stopEntry = async (rowIndex: number) => {
    await sqlUpdate([new Date().getTime()]).catch();
}

export const getEntries = async (count:number, offset:number, user: number) => {
    const res = await sqlSelect([user, count, offset]);
    // console.log(res, count, offset);
    return (res as object)['result'] ;
}

export const deleteOldData = () => {
    const timeLimit = new Date().getTime() - network.DELETE_LIMIT;
    sqlDelete([timeLimit])
    .then(()=>console.log('[SUCCESS]------||||| Deleted old data', new Date().toLocaleString()))
    .catch(()=>console.log('[ERROR]--------||||| Unable to delete old data' , new Date().toLocaleString()));
}

