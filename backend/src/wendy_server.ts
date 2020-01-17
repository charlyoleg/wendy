// wendy_server.ts

"use strict";

// A black-magic solution from ESM, waiting for the official support for es6-module by nodejs, planned with node-V12.0
// require = require("esm")(module/*, options*/);
// const wendy_core = require("./wendy_core.js");
//import * as wendy_core from "./wendy_core.js";

// const express = require('express');
// const https = require('https');
// const fs = require('fs');
import express from "express";
import fs from "fs";
import https from "https";
import path from "path";

const ssl_options = {
    key: fs.readFileSync("./srv_wendy.key"),
    cert: fs.readFileSync("./srv_wendy.crt")
};

const wendy_server = express();
const wendy_http_port = 9631;
const wendy_https_port = 9631;


// ####################################
// Browser security policy: Access-Control-Allow-Origin
// ####################################

wendy_server.use("/", (req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    next();
});


// ####################################
// wendy_core
// ####################################

let wendy_count = 0;


// ####################################
// rest-api end points
// ####################################

/**
 * @swagger
 * /quantumcom:
 *   get:
 *     description: Returns the a message
 *     parameters:
 *       - name: msg_id
 *         in: query
 *         required: true
 *         description: the hash of the requested message
 *         schema:
 *           type:string
 *     responses:
 *       200:
 *         description: the message
 */
wendy_server.get("/quantumcom", (req, res) => {
    console.log("wendy_server: quantumcom: req.query.msg_id: " + req.query.msg_id);
    wendy_count += 1;
    const r_msg = "hello guys! count: " + wendy_count.toString();
    res.send(r_msg);
});


// ####################################
// serving static files
// ####################################

wendy_server.use('/', express.static(path.join(__dirname, 'public')))


// ####################################
// main whole loop
// ####################################
// wendy_server.listen(wendy_http_port, () => {
//    console.log('wendy_server: listening at http port '+ wendy_http_port);
// });

https.createServer(ssl_options, wendy_server).listen(wendy_https_port, () => {
    console.log("wendy_server: listening at https port " + wendy_https_port);
});
