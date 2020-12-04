const e = require('express')
const { Pool, Client } = require('pg')
const pool = new Pool({
    user: 'blouqlco',
    host: 'john.db.elephantsql.com',
    database: 'blouqlco',
    password: 'NyUJIrI_hGmNkYSJ_zpjQ60uSkMMkzjI',
    port: 5432,
})

// ****** CHECK QUEUE ******
function checkQueue(c_id, q_id, callback) {
    let total;

    pool.connect((err, client, release) => {
        if (err) { // Error Handling for Pool
            return console.error('Error acquiring client', err.stack)
        }

        client.query(`SELECT * FROM queue WHERE UPPER(queue_id) = UPPER($1);`, [q_id], function (err, result) {     // check if queue exists
            if (err) {
                console.log(err)
                return callback(err, null)
            }

            if (result.rows.length == 0) {
                return callback({
                    "error": `Queue ID '${q_id}' cannot be found!`,
                    "code": "UNKNOWN_QUEUE"
                }, null)

            } else {
                let queueStatus = result.rows[0].status;
                // total no. of ppl that is still in queue (excluding those have missed the queue/already served)
                // COALESCE (return first non null value, if there are no served customers in queue (null), set it to 0)
                client.query(`SELECT COUNT(customer_id) "count" FROM customers WHERE UPPER(queue_id) = UPPER($1) AND row_no > (SELECT COALESCE((SELECT row_no FROM customers WHERE UPPER(queue_id) = UPPER($2) AND served = true ORDER BY row_no DESC LIMIT 1), 0));`, [q_id, q_id], function (err, result) {
                    if (err) {
                        console.log(err)
                        return callback(err, null)
                    } else {
                        total = parseInt(result.rows[0].count);
                    }
                    if (c_id != null) {
                        // check if customer exist in given queue
                        client.query('SELECT * FROM customers WHERE customer_id = $1 AND UPPER(queue_id) = UPPER($2)', [c_id, q_id], function (err, result) {
                            if (err) {
                                console.log(err)
                                return callback(err, null)
                            }

                            if (result.rows.length == 0) {
                                return callback(null, { "total": total, "ahead": -1, "status": queueStatus })
                            } else {


                                // (if customer_id is provided then run)
                                // number of customers that are served (negative value) -> MISSED
                                // select no. of customers that are served and row no > given row c_id (check if there are people that join later but already served)
                                client.query('SELECT COUNT(customer_id) "count" FROM customers WHERE served = true AND UPPER(queue_id) = UPPER($1) AND row_no > (SELECT row_no FROM customers WHERE customer_id = $2 AND UPPER(queue_id) = UPPER($3));', [q_id, c_id, q_id], function (err, result) {
                                    if (err) {
                                        console.log(err)
                                        return callback(err, null)
                                    }

                                    if (parseInt(result.rows[0].count) === 0) {
                                        // (if count is 0, customer )  
                                        // number of customers that are not served (positive value)
                                        // select no. of customers that are served and row no < given row c_id (count no. of people that join before and are served)
                                        client.query('SELECT COUNT(customer_id) "count" FROM customers WHERE served = false AND UPPER(queue_id) = UPPER($1) AND row_no < (SELECT row_no FROM customers WHERE customer_id = $2 AND UPPER(queue_id) = UPPER($3)) AND row_no > (SELECT COALESCE((SELECT row_no FROM customers WHERE UPPER(queue_id) = UPPER($4) AND served = true ORDER BY row_no DESC LIMIT 1), 0));', [q_id, c_id, q_id, q_id], function (err, result) {
                                            if (err) {
                                                console.log(err)
                                                return callback(err, null)
                                            }
                                            return callback(null, { "total": total, "ahead": parseInt(result.rows[0].count), "status": "ACTIVE" })
                                        })

                                    } else {
                                        // return callback(null, { "total": total, "ahead": parseInt(0 - result.rows[0].count), "status": "INACTIVE" })

                                        let status = total > 0 ? "ACTIVE" : "INACTIVE"      // if total is more than 0, queue is ACTIVE
                                        return callback(null, { "total": total, "ahead": -1, "status": status })
                                    }
                                })
                            }
                        })

                    } else {
                        return callback(null, { "total": total,"ahead":-1, "status": queueStatus })
                    }


                })

            }
        })
        client.release();
    })

}

function resetTables(callback) {
    pool.connect((err, client, release) => {
        if (err) {
            console.log(err)
            return callback(err, null)
        }
        client.query('TRUNCATE TABLE customers, queue;', function (err, result) {
            if (err) {
                callback(err, null)
            } else {
                callback(null, result)
            }
        })
        client.release();

    })
}

function closeDatabaseConnections() {
    return pool.end()
        .then(() => console.log('ENDED'))
        .catch((err) => console.log(err))

}

module.exports = {
    resetTables,
    closeDatabaseConnections,
};
