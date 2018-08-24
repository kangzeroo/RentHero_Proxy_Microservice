const Promise = require('bluebird')
const { promisify } = Promise
const pool = require('../db_connect')
const uuid = require('uuid')
const moment = require('moment')

// to run a query we just pass it to the pool
// after we're done nothing has to be taken care of
// we don't have to return any client to the pool or close a connection

const query = promisify(pool.query)

exports.update_proxy_number = (proxy_id, purchased_number) => {
  const p = new Promise((res, rej) => {
    const values = [proxy_id, purchased_number]
    const queryString = `UPDATE corporation_proxy
                            SET proxy_phone = $2,
                                updated_at = CURRENT_TIMESTAMP
                          WHERE proxy_id = $1
                        `

    query(queryString, values, (err, results) => {
      if (err) {
        console.log(`ERROR from ProxyQueries.update_proxy_number: `, err)
        rej('Failed to update number')
      }
      res()
    })

  })
  return p
}
