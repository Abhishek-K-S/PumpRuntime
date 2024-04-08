"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteOldData = exports.getEntries = exports.stopEntry = exports.createEntry = void 0;
const sqlite3_1 = __importDefault(require("sqlite3"));
const network_1 = require("./network");
const sqlite = sqlite3_1.default.verbose();
const db = new sqlite.Database('Database.db', (err) => {
    if (err) {
        console.log(err);
        process.exit(1);
    }
    else {
        console.log("CONNECTED TO DB");
    }
});
const dbName = 'runtime';
const toPromise = (fn, statement) => {
    return function (option) {
        return new Promise((resolve, reject) => {
            db[fn](statement, option, function (err, result) {
                if (err) {
                    reject(err);
                }
                else
                    resolve({ this: this, result });
            });
        });
    };
};
db.run(`CREATE TABLE IF NOT EXISTS ${dbName} (id INTEGER PRIMARY KEY, user INTEGER, start INTEGER, stop INTEGER)`);
const sqlCreate = toPromise('run', `INSERT INTO ${dbName}(user, start, stop) VALUES (?, ?, ?)`);
const sqlUpdate = toPromise('run', `UPDATE ${dbName} SET stop=?`);
const sqlSelect = toPromise('all', `SELECT * FROM ${dbName} WHERE user=? ORDER BY start DESC LIMIT ? OFFSET ? `);
const sqlDelete = toPromise('run', `DELETE FROM ${dbName} WHERE start < ?`);
const createEntry = (user_id, start, end) => __awaiter(void 0, void 0, void 0, function* () {
    const res = yield sqlCreate([user_id, start, end]);
    console.log(res.this);
});
exports.createEntry = createEntry;
const stopEntry = (rowIndex) => __awaiter(void 0, void 0, void 0, function* () {
    yield sqlUpdate([new Date().getTime()]).catch();
});
exports.stopEntry = stopEntry;
const getEntries = (count, offset, user) => __awaiter(void 0, void 0, void 0, function* () {
    const res = yield sqlSelect([user, count, offset]);
    // console.log(res, count, offset);
    return res['result'];
});
exports.getEntries = getEntries;
const deleteOldData = () => {
    const timeLimit = new Date().getTime() - network_1.network.DELETE_LIMIT;
    sqlDelete([timeLimit])
        .then(() => console.log('[SUCCESS]------||||| Deleted old data', new Date().toLocaleString()))
        .catch(() => console.log('[ERROR]--------||||| Unable to delete old data', new Date().toLocaleString()));
};
exports.deleteOldData = deleteOldData;
