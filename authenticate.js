import { SidechatAPIClient } from "sidechat.js";
import readline from "readline";
import fs from "fs";

require('dotenv').config()


const API = new SidechatAPIClient();

const phoneNumber = process.env.PHONE_NUMBER;
await API.loginViaSMS(phoneNumber);
console.log("SMS sent.");

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

rl.question("Enter SMS verification code: ", async (code) => {
    await API.verifySMSCode(phoneNumber, code);
    console.log("Successfully logged in.");

    const token = API.userToken;

    fs.writeFileSync('token.json', JSON.stringify({ token }), 'utf8');
    console.log("Token saved to token.json");
    
    rl.close();
});