import { Update, network } from "./network";
import axios from 'axios'

export const onlineStart = async (user_id:number) => {
    try{
        await axios.get(`${network.ONLINE}/start?t=${new Date().getTime()}`, {headers: {Authorization: network.ALLOWED_AUTHS[user_id]}})
    }
    catch(e){
        console.error('err----- online start api failed')
    }
}

const failedList: modUpdate[] = [];
const limit = 100;

type modUpdate = {
    user_id: number,
    obj: Update
}

const addToFailedList = (user_id: number, item: Update) => {

    while(failedList.length + 1 <= limit){
        failedList.shift()
    }

    failedList.push({user_id, obj: item})
}

const getFailedListItems = () => {
    const ls: modUpdate[] = [];
    for(let i = 0; i<Math.min(failedList.length, 5); i++)
        ls.push(failedList[i])
    return ls;
}

const destroyFailedListItems = (count: number) => {
    for(let i = 0; i < count; i++){
        failedList.shift();
    }
}

export const onlineStop = async (user_id: number, obj: Update | Update[], api='/stop') => {
    try{
        await axios.post(`${network.ONLINE}${api}?t=${new Date().getTime()}`, obj, {headers: {Authorization: network.ALLOWED_AUTHS[user_id]}})
    }
    catch(e){
        if(api=='/stop'){
            addToFailedList(user_id, obj as Update);
        }
        console.error('err----- online stop api failed')
        return false;
    }
    return true;
}

export const onlineEntry = async (user_id: number, obj: Update[]) => {
    const res = await onlineStop(user_id, obj, '/entry');
    if(res){
        destroyFailedListItems(obj.length);
    }
}

export const updateOldData = () => {
    const items: modUpdate[] = getFailedListItems();
    if(items.length){
        const user_id = items[0].user_id
        onlineEntry(user_id, items.map(e=>e.obj));
    }
}