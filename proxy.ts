import { createServer } from "https";
import Express from 'express'
import { readFileSync } from "fs";
import cors from 'cors'
import { config } from "dotenv";
import path from "path";

const pwd = process.cwd();

const options = {
    key: readFileSync(path.join(pwd, './private.key'), 'utf8'),
    cert: readFileSync(path.join(pwd, './certificate.crt'), 'utf8'),
    passphrase: 'pumpserver'
}

const app = Express();
app.use(cors({origin: ['https://pumpui.onrender.com', '*']}))
const server = createServer(options, app);
config();

const master = `${process.env.SERVER}:${process.env.PORT}`;
const port = process.env.PROXY

app.get('*', async (req, res)=>{
    const url = req.url;
    console.log(url);
    let result = {};
    let ec = 200;
    try{
        const resultt = await fetch(`${master}${url}`, {method: 'GET'});
        result = await resultt.json()
    }
    catch(e){
        result = {}
        ec = 500;
    }
    res.status(ec).send(result);
})

server.listen(parseInt(port, 10) || 9998, ()=>{
    console.log("[PROXY IS RUNNIG] ", port)
})