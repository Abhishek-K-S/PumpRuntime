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
const https_1 = require("https");
const express_1 = __importDefault(require("express"));
const fs_1 = require("fs");
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = require("dotenv");
const path_1 = __importDefault(require("path"));
const pwd = process.cwd();
const options = {
    key: (0, fs_1.readFileSync)(path_1.default.join(pwd, './private.key'), 'utf8'),
    cert: (0, fs_1.readFileSync)(path_1.default.join(pwd, './certificate.crt'), 'utf8'),
    passphrase: 'pumpserver'
};
const app = (0, express_1.default)();
app.use((0, cors_1.default)({ origin: ['https://pumpui.onrender.com', '*'] }));
const server = (0, https_1.createServer)(options, app);
(0, dotenv_1.config)();
const master = `${process.env.SERVER}:${process.env.PORT}`;
const port = process.env.PROXY;
app.get('*', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const url = req.url;
    console.log(url);
    let result = {};
    let ec = 200;
    try {
        const resultt = yield fetch(`${master}${url}`, { method: 'GET' });
        result = yield resultt.json();
    }
    catch (e) {
        result = {};
        ec = 500;
    }
    res.status(ec).send(result);
}));
server.listen(parseInt(port, 10) || 9998, () => {
    console.log("[PROXY IS RUNNIG] ", port);
});
