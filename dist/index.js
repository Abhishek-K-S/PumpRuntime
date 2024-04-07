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
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const network_1 = require("./network");
const services_1 = require("./services");
const cron_1 = require("./cron");
(0, network_1.configure)();
require('./db');
const app = (0, express_1.default)();
const httpServer = new http_1.Server(app);
const port = process.env.PORT;
app.use((0, cors_1.default)({ origin: '*' }));
app.get('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    res.send(`Server is up: System time is ${new Date()}`);
}));
// app.get('/start', authHandler, startHandler);
// app.get('/ping', authHandler, pingHandler);
// app.get('/stop', authHandler, stopHandler);
app.get('/history', services_1.limitter, services_1.getHistory);
app.get('/active', services_1.limitter, services_1.getActiveRuntimes);
const ws = new ws_1.WebSocketServer({ server: httpServer });
ws.on("connection", socket => {
    console.log('comeone connected');
    socket.on('message', ms => {
        try {
            const message = ms.toString();
            const converted = JSON.parse(message);
            let user_id = null;
            switch (converted.event) {
                case "start":
                    user_id = (0, services_1.authHandler)(converted.data);
                    if (user_id !== null)
                        (0, services_1.startHandler)(user_id);
                    break;
                case "pingg":
                    user_id = (0, services_1.authHandler)(converted.data);
                    if (user_id !== null)
                        (0, services_1.pingHandler)(user_id);
                    break;
                case "stop":
                    user_id = (0, services_1.authHandler)(converted.data);
                    if (user_id !== null)
                        (0, services_1.stopHandler)(user_id);
                    break;
            }
        }
        catch (e) {
            console.log(e);
        }
    });
});
httpServer.listen(port, () => {
    console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
    cron_1.deleteCron.start();
});
