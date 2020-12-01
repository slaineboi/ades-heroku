const e = require('express')
const { Pool, Client } = require('pg')
const pool = new Pool({
    user: 'blouqlco',
    host: 'john.db.elephantsql.com',
    database: 'blouqlco',
    password: 'NyUJIrI_hGmNkYSJ_zpjQ60uSkMMkzjI',
    port: 5432,
})


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
