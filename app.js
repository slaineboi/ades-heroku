const express = require('express'); // DO NOT DELETE
const cors = require('cors');
const validate = require('jsonschema').validate;
const app = express(); // DO NOT DELETE

const database = require('./database');
const { queue, log } = require('async');

app.use(cors());
app.use(express.json())

/**
 * =====================================================================
 * ========================== CODE STARTS HERE =========================
 * =====================================================================
 */

/**
 * ========================== SETUP APP =========================
 * CHER SAID WE CAN IGNORE THIS
 */

/**
 * JSON Body
 */

/**
 * ========================== RESET API =========================
 */

/**
 * Reset API
 */
app.post('/reset', function (req, res) {//Idk if this is the right way to do it.
    database.resetTables(function (err, result) {
        if (err) {
            res.status(500).send({
                "error": "Unable to establish connection with database",
                "code": "UNEXPECTED_ERROR"
            })
        }
        else {
            res.status(200).end()
        }
    })
})



/**
 * ========================== UTILS =========================
 */


/**
 * 404
 */
app.use(function (req, res, next) { //404
    res.status(404).json(
        {
            error: "Path not found",
            code: "UNKNOWN_PATH"
        }
    )
})

/**
 * Error Handler
 */
app.use(function (err, req, res, next) {
    res.status(500).json(
        {
            error: "Unable to establish connection with database",
            code: "UNEXPECTED_ERROR"
        }
    )
})


function tearDown() {
    // DO NOT DELETE
    return database.closeDatabaseConnections();
}

/**
 *  NOTE! DO NOT RUN THE APP IN THIS FILE.
 *
 *  Create a new file (e.g. server.js) which imports app from this file and run it in server.js
 */

module.exports = { app, tearDown }; // DO NOT DELETE
