import fs from "fs";
import path from "path";
import express from "express";
import ngrok from '@ngrok/ngrok'
import {generateInstagramPost} from "./controllers/posts.controller.js";
import { CronJob } from 'cron';


if (!fs.existsSync("./output")) {
  fs.mkdirSync("./output");
}
if (!fs.existsSync("./fonts")) {
  fs.mkdirSync("./fonts");
}
if (!fs.existsSync("./images")) {
  fs.mkdirSync("./images");
}

const app = express();

let NGROKPATH;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.set
app.use('/output',express.static("output"));
app.use('/images',express.static("images"));

(async function () {
  console.log("Starting ngrok...");
  const listener = await ngrok.forward( {
    addr: process.env.PORT || 3000,
    authtoken: process.env.NGROK_AUTH_TOKEN,
  })
  NGROKPATH=listener.url();
  console.log("ngrok url: ", listener.url());
})()

const job = new CronJob(
	'0 14,17,7 * * *', 
	async function () {
		await generateInstagramPost(NGROKPATH);
	}, 
	null, 
	true,
	'UTC+5:30'
);



app.get("/", (req, res) => {
  res.send('autogen API is running!');
})

app.get('/generate', async (req, res) => {
  const filePath = await generateInstagramPost(NGROKPATH)

  res.send(`
    Post generated! <br> <a href="${process.env.APP_URL||NGROKPATH}/${filePath}">Click here to view the image</a> ${NGROKPATH}/${filePath}`);
})





const port = process.env.PORT || 3000;
app.listen(port, () => {
  
})

