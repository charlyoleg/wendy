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
import bodyParser from "body-parser";
import fs from "fs";
import https from "https";
import path from "path";

const ssl_options = {
    key: fs.readFileSync("./srv_wendy.key"),
    cert: fs.readFileSync("./srv_wendy.crt")
};

const wendy_server = express();
const textParser = bodyParser.text()
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

let yellow_counter = 0;
let quantum_msgs = new Map<string,string>();


// ####################################
// rest-api end points
// ####################################

/**
 * @swagger
 * /yellow_counter:
 *   get:
 *     description: Returns the incrementing yellow_counter
 *     responses:
 *       200:
 *         description: the yellow_counter in json
 */
wendy_server.get("/yellow_counter", (req, res) => {
    yellow_counter += 1;
    console.log("wendy_server: yellow_counter: " + yellow_counter.toString());
    //res.send(yellow_counter.toString());
    res.json({ yellow_counter : yellow_counter.toString() });
});


/**
 * @swagger
 * /quantumcom:
 *   get:
 *     description: Returns the a message
 *     parameters:
 *       - name: msg_id
 *         in: query
 *         required: true
 *         description: the msg-id of the requested message
 *         schema:
 *           type:string
 *     responses:
 *       default:
 *         description: Bad request
 *       '200':
 *         description: message returned and deleted
 *       '404':
 *         description: no message found
 *   post:
 *     description: Returns the a message
 *     parameters:
 *       - name: msg_id
 *         in: query
 *         required: true
 *         description: the msg-id of the requested message
 *         schema:
 *           type:string
 *     requestBody:
 *       description: a raw message
 *       required: true
 *       content:
 *         text/plain:
 *         schema:
 *           type: string
 *     responses:
 *       default:
 *         description: Bad request
 *       '201':
 *         description: message created
 */
wendy_server.get("/quantumcom/:msg_id", (req, res) => {
  if(quantum_msgs.has(req.params.msg_id)){
    //const r_quantum_msg = "GET quantumcom: " + req.params.msg_id + " : Yes";
    const r_quantum_msg = quantum_msgs.get(req.params.msg_id);
    console.log("GET message ID " + req.params.msg_id);
    //console.log(r_quantum_msg);
    res.send(r_quantum_msg);
  }else{
    console.log("GET message ID " + req.params.msg_id + " : NULL");
    res.status(404).end();
  }
});

wendy_server.post("/quantumcom/:msg_id", textParser, (req, res) => {
  //const new_quantum_msg = "POST quantumcom: " + req.params.msg_id;
  const new_quantum_msg = req.body;
  console.log("POST msg ID " + req.params.msg_id);
  //console.log(new_quantum_msg)
  let resBody = "Written";
  if(quantum_msgs.has(req.params.msg_id)){
    resBody = "Overwritten";
    console.log("key " + req.params.msg_id + " already exists and will be overwritten!")
  }
  quantum_msgs.set(req.params.msg_id, new_quantum_msg);
  res.send(resBody);
});


// ####################################
// serving static files
// ####################################

wendy_server.use('/', express.static(path.join(__dirname, 'public')));


// ####################################
// serving static files
// ####################################

wendy_server.use(function (req, res, next) {
  res.status(404).send("Hey abc, Sorry can't find that!");
});


// ####################################
// main whole loop
// ####################################
// wendy_server.listen(wendy_http_port, () => {
//    console.log('wendy_server: listening at http port '+ wendy_http_port);
// });

https.createServer(ssl_options, wendy_server).listen(wendy_https_port, () => {
    console.log("wendy_server: listening at https port " + wendy_https_port);
});
