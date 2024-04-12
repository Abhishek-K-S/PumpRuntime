import { config } from "dotenv";

export const network:Network = {
    ALLOWED_AUTHS : [],
    TIMEOUT: 10000,
    ACTIVE: new Map(),
    TIMEOUTS_LIST: new Map(),
    DELETE_LIMIT: 60 * 24 * 60 * 60* 1000
}

type Network = {
    ALLOWED_AUTHS : string[],
    TIMEOUT: number,
    ACTIVE: ActiveType,
    TIMEOUTS_LIST: Map<number, NodeJS.Timeout>,
    DELETE_LIMIT: number
}

export type Update = {
    start_at: number,
    last_ping: number
}

export type ActiveType = Map<number, Update>

export const configure = () => {
    config();
    network.ALLOWED_AUTHS = process.env.ALLOWED_AUTHS?.split(',') || [],
    process.env.TZ = 'Asia/Kolkata';
}