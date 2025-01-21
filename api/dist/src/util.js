"use strict";
// write a method to scramble a string
Object.defineProperty(exports, "__esModule", { value: true });
exports.scramble = void 0;
const scramble = (str) => {
    const arr = str.split("");
    let scrambled = arr.sort(() => 0.5 - Math.random()).join("");
    // Check if the scrambled word is the same as the original word
    // If they are the same, scramble it again (optional)
    while (scrambled === str) {
        scrambled = arr.sort(() => 0.5 - Math.random()).join("");
    }
    return scrambled;
};
exports.scramble = scramble;
