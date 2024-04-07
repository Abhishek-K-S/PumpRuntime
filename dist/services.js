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
Object.defineProperty(exports, "__esModule", { value: true });
exports.limitter = exports.authHandler = exports.getHistory = exports.getActiveRuntimes = exports.stopHandler = exports.pingHandler = exports.startHandler = void 0;
const network_1 = require("./network");
const db_1 = require("./db");
const startHandler = (user_id) => __awaiter(void 0, void 0, void 0, function* () {
    // await createEntry(req.user_id);
    yield stopExisting(user_id);
    network_1.network.ACTIVE.set(user_id, { start_at: new Date().getTime(), last_ping: new Date().getTime() });
    startOrUpdateTimeout(user_id);
});
exports.startHandler = startHandler;
const pingHandler = (user_id) => {
    startOrUpdateTimeout(user_id);
};
exports.pingHandler = pingHandler;
const stopHandler = (user_id) => {
    if (network_1.network.TIMEOUTS_LIST.has(user_id)) {
        clearTimeout(network_1.network.TIMEOUTS_LIST.get(user_id));
        network_1.network.TIMEOUTS_LIST.delete(user_id);
    }
    stopExisting(user_id);
};
exports.stopHandler = stopHandler;
const getActiveRuntimes = (req, res) => {
    try {
        const { device } = req.query;
        if (typeof device === 'string') {
            if (network_1.network.ACTIVE.has(parseInt(device))) {
                const result = network_1.network.ACTIVE.get(parseInt(device));
                res.status(200).send({ status: true, data: result });
                return;
            }
            res.status(200).send({ status: false });
            return;
        }
    }
    catch (e) {
    }
    res.status(500).send('Not found');
};
exports.getActiveRuntimes = getActiveRuntimes;
const startOrUpdateTimeout = (user_id) => {
    if (network_1.network.TIMEOUTS_LIST.has(user_id)) {
        clearTimeout(network_1.network.TIMEOUTS_LIST.get(user_id));
    }
    if (network_1.network.ACTIVE.has(user_id)) {
        const timeout = setTimeout(() => {
            stopExisting(user_id);
        }, network_1.network.TIMEOUT);
        network_1.network.TIMEOUTS_LIST.set(user_id, timeout);
        network_1.network.ACTIVE.get(user_id).last_ping = new Date().getTime();
    }
};
const stopExisting = (user_id) => __awaiter(void 0, void 0, void 0, function* () {
    if (network_1.network.ACTIVE.has(user_id)) {
        console.log('Stopped ------', user_id);
        const runtime = network_1.network.ACTIVE.get(user_id);
        if (runtime.start_at + 10000 < runtime.last_ping)
            yield (0, db_1.createEntry)(user_id, runtime.start_at, runtime.last_ping);
        network_1.network.ACTIVE.delete(user_id);
    }
});
const getHistory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let { count, offset, device } = req.query;
        if (typeof count === 'undefined')
            count = '20';
        if (typeof offset === 'undefined')
            offset = '0';
        if (typeof count === 'string' && typeof offset === 'string' && typeof device === 'string') {
            const parsedCount = parseInt(count);
            const parsedOffset = parseInt(offset);
            const parsedDevice = Math.abs(parseInt(device));
            if (parsedDevice < network_1.network.ALLOWED_AUTHS.length) {
                const actualOffset = Math.abs(parsedOffset);
                const actualCount = Math.min(Math.abs(parsedCount), 50);
                const result = yield (0, db_1.getEntries)(actualCount, actualOffset, parsedDevice);
                res.status(200).send(result);
                return;
            }
        }
    }
    catch (e) {
    }
    res.status(500).send('Error while fetching the info');
});
exports.getHistory = getHistory;
const authHandler = (auth) => {
    console.log(auth);
    if (auth) {
        let index = network_1.network.ALLOWED_AUTHS.findIndex((value) => value == auth);
        console.log(index);
        if (index >= 0) {
            req.user_id = index;
            console.log(req.url);
            next();
            return;
        }
    }
    return null;
};
exports.authHandler = authHandler;
let isAllowed = true;
const limitter = (req, res, next) => {
    console.log('Request for history: ', isAllowed);
    if (isAllowed) {
        isAllowed = false;
        next();
        setTimeout(() => isAllowed = true, 50);
    }
    else
        res.status(500).send('Not allowed');
};
exports.limitter = limitter;
