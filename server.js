"use strict";

import * as cheerio from "cheerio";
import express from "express";
import WebSocket from "websocket";
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --target --port
const ARGS = process.argv.slice(2).map(arg => {
  return arg.split("=");
}).reduce((acc, [key, value], index) => {
  if (index == 0 && !value) {
    value = key;
    key = "--target";
  }
  acc[key.replace(/^-+/, "")] = value ?? true;
  return acc;
}, {});

const PORT = ARGS.port ?? ARGS.P ?? 3000;
const TARGET_PATH = ARGS.target ?? ARGS.T;
const ROOT_PATH = process.cwd();
// const ROOT_PATH = path.resolve(path.dirname(TARGET_PATH));
// const SCRIPT_PATH = path.relative(ROOT_PATH, path.join(__dirname, "client.js"));
const SCRIPT_DATA = fs.readFileSync(path.join(__dirname, "client.js"), "utf8")
  .replace("new WebSocket();", `new WebSocket("ws://127.0.0.1:${PORT}/");`);

const app = express();

// Environments
app.set('port', PORT);

// HTML file routings
app.get('*', (req, res, next) => {
  const { url } = req;
  if (url === "" || url === "/") {
    const html = fs.readFileSync(TARGET_PATH, 'utf8');
    const $ = cheerio.load(html);
    $("body").append(`<script>${SCRIPT_DATA}</script>`);
    res.write($.root().html());
    res.end();
  } else if (/\.html$/.test(url)) {
    const html = fs.readFileSync(path.join(process.cwd(), url), 'utf8');
    const $ = cheerio.load(html);
    $("body").append(`<script>${SCRIPT_DATA}</script>`);
    res.write($.root().html());
    res.end();
  } else {
    next();
  }
});

// Static files
app.use(express.static(ROOT_PATH, { index: false }));

const server = http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});

const socket = new WebSocket.server({
  httpServer: server,
  autoAcceptConnections: true,
});

// socket.on("request", function (req) {
//   const connection = req.accept();
//   connection.on('message', function(message) {
//     if (message.type === 'utf8') {
//         console.log('Received Message: ' + message.utf8Data);
//         connection.sendUTF(message.utf8Data);
//     }
//     else if (message.type === 'binary') {
//         console.log('Received Binary Message of ' + message.binaryData.length + ' bytes');
//         connection.sendBytes(message.binaryData);
//     }
//   });
// });