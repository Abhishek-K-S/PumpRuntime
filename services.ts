import { Request, Response, NextFunction } from "express"
import { ActiveType, Update, network } from "./network";
import { createEntry, getEntries } from "./db";

export const startHandler = async (req:Request, res:Response) => {
    stopExisting(req.user_id);
    network.ACTIVE.set(req.user_id, {start_at: new Date().getTime(), last_ping: new Date().getTime()})
    res.status(200).send('ok');
}

export const stopHandler = (req:Request, res:Response) => {
    const {user_id} = req;
    const body = req.body as Update
    if(body){
        stopExisting(user_id);
        createEntry(user_id, body.start_at, body.last_ping);
    }
    res.status(200).send('ok');
}

export const getActiveRuntimes = (req:Request, res:Response) => {
    try{
        const {device} = req.query;
        if(typeof device === 'string'){
            if(network.ACTIVE.has(parseInt(device))){
                const result = network.ACTIVE.get(parseInt(device));
                res.status(200).send({status: true, data: result})
                return;
            }
            res.status(200).send({status: false})
            return;
        }
    }
    catch(e){
    }
    res.status(500).send('Not found');
}

const stopExisting = (user_id: number) => {
    if(network.ACTIVE.has(user_id)){
        console.log('Stopped ------', user_id)
        network.ACTIVE.delete(user_id);
    }
}

export const getHistory = async (req: Request, res: Response) => {
    try{
        let {count, offset, device} = req.query;
        if(typeof count === 'undefined') count = '20';
        if(typeof offset === 'undefined') offset = '0';
        if(typeof count === 'string' && typeof offset === 'string' && typeof device === 'string'){
            const parsedCount = parseInt(count)
            const parsedOffset = parseInt(offset)
            const parsedDevice = Math.abs(parseInt(device))
            if(parsedDevice < network.ALLOWED_AUTHS.length){
                const actualOffset = Math.abs(parsedOffset);
                const actualCount = Math.min(Math.abs(parsedCount), 50);
                const result = await getEntries(actualCount, actualOffset, parsedDevice)
                res.status(200).send(result);
                return;
            }
        }
    }
    catch(e){
    }
    res.status(500).send('Error while fetching the info')
}

export const authHandler = (req:Request, res:Response, next: NextFunction) => {
    const auth = req.headers.authorization
    console.log(auth)
    
    if(auth){
        let index = network.ALLOWED_AUTHS.findIndex((value)=>value==auth)
        console.log(index)
        if(index>=0){
            req.user_id = index;
            console.log(req.url)
            next();
            return;
        }
    }

    res.status(200).send('Not authorised');
}

let isAllowed = true;
export const limitter = (req: Request, res: Response, next: NextFunction) => {
    console.log('Request for history: ', isAllowed)
    if(isAllowed){
        isAllowed = false;
        next()
        setTimeout(()=>isAllowed = true, 50);
    }
    else res.status(500).send('Not allowed');
}

export const makeDbEntry = (req: Request, res: Response) => {
    try{
        const user_id = req.user_id;
        const body = req.body as Update[];
        if(Array.isArray(body)){
            body.forEach(async entry=>{
                createEntry(user_id, entry.start_at, entry.last_ping);
            })
        }
        res.status(200).send('ok');
    }
    catch(e){
        res.status(500).send('Not ok');
    }
}