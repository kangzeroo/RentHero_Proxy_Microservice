const Promise = require('bluebird')
const { promisify } = Promise
const pool = require('../db_connect')
const uuid = require('uuid')
const moment = require('moment')

// to run a query we just pass it to the pool
// after we're done nothing has to be taken care of
// we don't have to return any client to the pool or close a connection

const query = promisify(pool.query)


exports.insert_tour = (session_id, ad, tour, lead_name, staff_name) => {
  const p = new Promise((res, rej) => {
    const tour_id = uuid.v4()
    const values = [tour_id, session_id, ad.ad_id, tour.tour_begin, tour.tour_end]
    const queryString = `INSERT INTO tours (tour_id, session_id, ad_id, tour_begin, tour_end)
                            VALUES ($1, $2, $3, $4, $5)
                        `

    query(queryString, values, (err, results) => {
      if (err) {
        console.log('ERROR FROM TourQueries.insert_tour: ', err)
        rej('Failed to create tour')
      }
      res({
        message: `Successfully created tour at ${ad.short_address} between ${lead_name} and ${staff_name} on ${moment(tour.tour_begin).format('llll')}. SMS successfully sent to both parties`,
        tour_id: tour_id,
        session_id: session_id,
      })
    })
  })
  return p
}

exports.get_tour_from_session = (session_id) => {
  console.log('get_tour_from_session: ', session_id)
  const p = new Promise((res, rej) => {
    const values = [session_id]
    const queryString = `SELECT CONCAT(c.street_code, ' ', c.street_name, ', ', c.city) AS short_address
                           FROM tours a
                           INNER JOIN advertisements b
                           ON a.ad_id = b.ad_id
                           INNER JOIN address c
                           ON b.address_id = c.address_id
                          WHERE a.session_id = $1
                        `

    query(queryString, values, (err, results) => {
      if (err) {
        console.log('ERROR FROM TourQueries.get_tour_from_session: ', err)
        rej(err)
      }
      console.log(results.rows[0])
      res(results.rows[0])
    })
  })
  return p
}
