"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const cors = require("cors");
//For env File
dotenv_1.default.config();
const app = (0, express_1.default)();
app.use(cors());
const port = process.env.PORT || 8000;
// app.post("/", async (req: any, res: any) => {
//   console.log("got here")
// })
app.get("/", (req, res) => {
    res.send("Welcome to Express & TypeScript Server");
});
// app.post("/new/", async (req, res) => {
//   // get word from api
//   console.log("got here")
//   const url = "https://random-word-api.herokuapp.com/word"
//   console.log("url:", url)
//   axios
//     .get(url)
//     .then((response) => {
//       // Handle the JSON response here
//       console.log("Response:", response.data)
//     })
//     .catch((error) => {
//       // Handle any errors that occurred during the request
//       console.error("Error:", error)
//     })
//   return res.status(200).json({ message: "New game created" })
// })
// app.listen(port, () => {
//   console.log(`Server is Fire at http://localhost:${port}`)
// })
