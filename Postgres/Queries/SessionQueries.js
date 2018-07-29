const Promise = require('bluebird')
const { promisify } = Promise
const pool = require('../db_connect')
const uuid = require('uuid')
const moment = require('moment')

// to run a query we just pass it to the pool
// after we're done nothing has to be taken care of
// we don't have to return any client to the pool or close a connection

const query = promisify(pool.query)

exports.create_session = (session_name, status, date_expiry) => {
  const p = new Promise((res, rej) => {
    const session_id = uuid.v4()
    const values = [session_id, session_name, status, date_expiry]
    const queryString = `INSERT INTO sessions (session_id, session_name, status, date_expiry)
                          VALUES ($1, $2, $3, $4)
                        `

    query(queryString, values, (err, results) => {
      if (err) {
        console.log(`ERROR FROM SessionQueries.create_session : `, err)
        rej(err)
      }
      res({
        message: `Successfully Created Session ${session_id}`,
        session_id: session_id,
      })
    })
  })
  return p
}

exports.update_session_interaction = (session_id, timestamp) => {
  const p = new Promise((res, rej) => {
    const values = [session_id, timestamp]
    const queryString = `UPDATE sessions
                            SET date_last_interaction = $2,
                                date_updated = CURRENT_TIMESTAMP,
                                status = 'in-progress'
                          WHERE session_id = $1
                        `

    query(queryString, values, (err, results) => {
      if (err) {
        console.log(`ERROR FROM SessionQueries.update_session_interaction: `, err)
        rej(err)
      }
      res({
        message: 'Successfully updated session'
      })
    })
  })
  return p
}

exports.update_session_start = (session_id, timestamp) => {
  const p = new Promise((res, rej) => {
    const values = [session_id, timestamp]
    const queryString = `UPDATE sessions
                            SET date_started = $2,
                                date_updated = CURRENT_TIMESTAMP,
                                status = 'in-progress'
                          WHERE session_id = $1
                        `

    query(queryString, values, (err, results) => {
      if (err) {
        console.log(`ERROR FROM SessionQueries.update_session_start: `, err)
        rej(err)
      }
      res({
        message: 'Successfully updated session'
      })
    })
  })
  return p
}
