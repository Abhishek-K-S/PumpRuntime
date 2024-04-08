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
const port = process.env.PORT;
app.use((0, cors_1.default)({ origin: '*' }));
app.get('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    res.send(`Server is up: System time is ${new Date()}`);
}));
app.get('/start', services_1.authHandler, services_1.startHandler);
app.get('/ping', services_1.authHandler, services_1.pingHandler);
app.get('/stop', services_1.authHandler, services_1.stopHandler);
app.get('/history', services_1.limitter, services_1.getHistory);
app.get('/active', services_1.limitter, services_1.getActiveRuntimes);
app.listen(port, () => {
    console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
    cron_1.deleteCron.start();
});
