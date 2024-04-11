import { Request, Response, NextFunction } from "express"
import { network } from "./network";
import { createEntry, getEntries } from "./db";

export const startHandler = async (req:Request, res:Response) => {
    // await createEntry(req.user_id);
    await stopExisting(req.user_id);
    network.ACTIVE.set(req.user_id, {start_at: new Date().getTime(), last_ping: new Date().getTime()})
    startOrUpdateTimeout(req.user_id)
    res.status(200).send('ok');
}

export const pingHandler = (req:Request, res:Response) => {
    startOrUpdateTimeout(req.user_id);
    res.status(200).send('ok')
}

export const stopHandler = (req:Request, res:Response) => {
    const {user_id} = req;
    if(network.TIMEOUTS_LIST.has(user_id)){
        clearTimeout(network.TIMEOUTS_LIST.get(user_id));
        network.TIMEOUTS_LIST.delete(user_id);
    }
    stopExisting(req.user_id);
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

const startOrUpdateTimeout = (user_id: number) => {
    if(network.TIMEOUTS_LIST.has(user_id)){
        clearTimeout(network.TIMEOUTS_LIST.get(user_id))
    }
    if(network.ACTIVE.has(user_id)){
        const timeout = setTimeout(() => {
            stopExisting(user_id);
        }, network.TIMEOUT);
        network.TIMEOUTS_LIST.set(user_id, timeout);
        network.ACTIVE.get(user_id).last_ping = new Date().getTime();

    }
}

const stopExisting = async (user_id: number) => {
    if(network.ACTIVE.has(user_id)){
        console.log('Stopped ------', user_id)
        const runtime = network.ACTIVE.get(user_id);
        if(runtime.start_at + 30000 <  runtime.last_ping)
            await createEntry(user_id, runtime.start_at, runtime.last_ping)
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