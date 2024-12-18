#!/usr/bin/env node
"use strict";

import path from "node:path";
import nodemon from "nodemon";
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const serverPath = path.relative(process.cwd(), path.join(__dirname, "server.js"));
const clientPath = path.relative(process.cwd(), path.join(__dirname, "client.js"));

nodemon({
  watch: process.cwd(),
  script: serverPath,
  ext: 'js mjs cjs json html',
  args: process.argv.slice(2),
});

nodemon
  .on('start', function () {
    console.log('App has started');
  })
  .on('quit', function () {
    console.log('App has quit');
    process.exit();
  })
  .on('restart', function (files) {
    console.log('App restarted due to: ', files);
  });
