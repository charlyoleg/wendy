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
import crypto from "crypto";




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
// helper functions
// ####################################

async function digestMessage(message: string) {
  //const msgUint8 = new encoding.TextEncoder().encode(message);                  // encode as (utf-8) Uint8Array
  //const hashBuffer = await cryptosubtle.digest('SHA-256', msgUint8);            // hash the message
  //const hashArray = Array.from(new Uint8Array(hashBuffer));                     // convert buffer to byte array
  //const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join(''); // convert bytes to hex string
  const hashHex = crypto.createHash('sha256').update(message).digest('hex');
  return hashHex;
}


// ####################################
// wendy_core
// ####################################

const c_message_size_max = 10; // don't push message longer than that
const c_message_size_min = 5; // don't push message shorter than that
const c_msg_id_digest_size = 5; // size of the first part of msg_id "abcde-134"

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
    //res.end(yellow_counter.toString());
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
    quantum_msgs.delete(req.params.msg_id); // delete read message to make it quantum!
    console.log("GET message ID " + req.params.msg_id);
    //console.log(r_quantum_msg);
    res.end(r_quantum_msg);
  }else{
    console.log("GET message ID " + req.params.msg_id + " : NULL");
    res.status(404).end();
  }
});

wendy_server.post("/quantumcom/:msg_id", textParser, async (req, res) => {
  //const new_quantum_msg = "POST quantumcom: " + req.params.msg_id;
  const new_quantum_msg = req.body;
  console.log("POST msg ID " + req.params.msg_id);
  //console.log(new_quantum_msg)
  let resBody = "Pushed";
  const msg_size = new_quantum_msg.length;
  if(msg_size > c_message_size_max){
    const text_explanation = c_message_size_min.toString() + " < " +  msg_size.toString() + " < " + c_message_size_max.toString();
    resBody = "Refused by server: Too short or too long : " + text_explanation;
    console.log("Refuse message ID " + req.params.msg_id + " Too short or too long : " + text_explanation);
    res.status(403).end(resBody);
    return;
  }
  const msg_digest = await digestMessage(new_quantum_msg);
  const expected_msg_id = msg_digest.substring(0, c_msg_id_digest_size) + "-" + msg_size.toString();
  if(expected_msg_id != req.params.msg_id){
    const text_explanation = req.params.msg_id + " != " + expected_msg_id;
    resBody = "Refused by server: Wrong message-ID : " + text_explanation;
    console.log("Refuse message ID " + req.params.msg_id + " Wrong message-ID : " + text_explanation);
    res.status(403).end(resBody);
    return;
  }
  if(quantum_msgs.has(req.params.msg_id)){
    resBody = "Over-pushed";
    console.log("key " + req.params.msg_id + " already exists and will be overwritten!")
  }
  quantum_msgs.set(req.params.msg_id, new_quantum_msg);
  res.end(resBody);
});


// ####################################
// serving static files
// ####################################

wendy_server.use('/', express.static(path.join(__dirname, 'public')));


// ####################################
// serving static files
// ####################################

wendy_server.use(function (req, res, next) {
  res.status(404).end("Hey abc, Sorry can't find that!");
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
