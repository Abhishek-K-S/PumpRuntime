"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.markActive = exports.configure = exports.network = void 0;
const dotenv_1 = require("dotenv");
exports.network = {
    ALLOWED_AUTHS: [],
    TIMEOUT: 10000,
    ACTIVE: new Map(),
    TIMEOUTS_LIST: new Map(),
    DELETE_LIMIT: 60 * 24 * 60 * 60 * 1000
};
const configure = () => {
    var _a;
    (0, dotenv_1.config)();
    exports.network.ALLOWED_AUTHS = ((_a = process.env.ALLOWED_AUTHS) === null || _a === void 0 ? void 0 : _a.split(',')) || [],
        process.env.TZ = 'Asia/Kolkata';
};
exports.configure = configure;
const markActive = (user_id, row_index) => {
    if (exports.network.ACTIVE.has(user_id)) {
    }
};
exports.markActive = markActive;
