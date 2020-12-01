const e = require('express')
const { Pool, Client } = require('pg')
const pool = new Pool({
    user: 'ftzvjgxu',
    host: 'john.db.elephantsql.com',
    database: 'ftzvjgxu',
    password: 'gQt5XXIrCa81Dcn2MTonBdeQc59ER4Aw',
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
