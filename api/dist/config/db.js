"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
const postgres_1 = __importDefault(require("postgres"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
console.log('Attempting database connection with URI:', (_a = process.env.DATABASE_URI) === null || _a === void 0 ? void 0 : _a.replace(/:.*@/, ':****@')); // Safely log URL
const sql = (0, postgres_1.default)(process.env.DATABASE_URI, {
    onnotice: () => { },
    onparameter: () => { },
    debug: (connection, query, params) => {
        console.log('SQL Query:', query);
        console.log('Parameters:', params);
    },
});
// Test the connection here
sql `SELECT 1`.then(() => {
    console.log('Database connection successful');
}).catch(err => {
    console.error('Database connection failed:', err);
});
exports.default = sql;
