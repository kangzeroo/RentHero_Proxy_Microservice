const Promise = require('bluebird')
const { promisify } = Promise
const pool = require('../db_connect')
const uuid = require('uuid')
const moment = require('moment')

// to run a query we just pass it to the pool
// after we're done nothing has to be taken care of
// we don't have to return any client to the pool or close a connection

const query = promisify(pool.query)

exports.get_active_participants_for_staff = (staff_id) => {
  const p = new Promise((res, rej) => {
    const values = [staff_id]
    const queryString = `SELECT *
                           FROM participants
                           WHERE staff_id = $1
                             AND date_deleted IS NULL
                        `

    query(queryString, values, (err, results) => {
      if (err) {
        console.log('ERROR FROM ParticipantQueries.get_active_participants_for_staff: ', err)
        rej(err)
      }
      res(results)
    })
  })
  return p
}

exports.insert_staff_participant = (session_id, staff, identifier, proxy_identifier, proxy_identifier_sid) => {
  const p = new Promise((res, rej) => {
    const values = [session_id, staff.staff_id, staff.friendly_name, identifier, proxy_identifier, proxy_identifier_sid]
    const queryString = `INSERT INTO participants (session_id, staff_id, friendly_name, identifier, proxy_identifier, proxy_identifier_sid)
                            VALUES ($1, $2, $3, $4, $5, $6)
                          RETURNING participant_id
                        `

    query(queryString, values, (err, results) => {
      if (err) {
        console.log('ERROR FROM ParticipantQueries.insert_staff_participant: ', err)
        rej(err)
      }
      const participant_id = results.rows[0].participant_id
      res({
        message: `Successfully created staff_participant (participant_id: ${participant_id}) , for staff (staff_id: ${staff.staff_id}), under session (session_id: ${session_id})`,
        session_id: session_id,
        staff: staff,
        participant_id: participant_id,
        identifier: identifier,
        proxy_identifier: proxy_identifier,
        proxy_identifier_sid: proxy_identifier_sid,
        proxy: {
          phoneNumber: proxy_identifier,
          sid: proxy_identifier_sid,
        }
      })
    })
  })
  return p
}

exports.get_active_participants_for_lead = (lead_id) => {
  const p = new Promise((res, rej) => {
    const values = [lead_id]
    const queryString = `SELECT *
                           FROM participants
                           WHERE lead_id = $1
                             AND date_deleted IS NULL
                        `

    query(queryString, values, (err, results) => {
      if (err) {
        console.log('ERROR FROM ParticipantQueries.get_active_participants_for_lead: ', err)
        rej(err)
      }
      res(results)
    })
  })
  return p
}


exports.insert_lead_participant = (session_id, lead, identifier, proxy_identifier, proxy_identifier_sid) => {
  const p = new Promise((res, rej) => {
    const values = [session_id, lead.lead_id, lead.friendly_name, identifier, proxy_identifier, proxy_identifier_sid]
    const queryString = `INSERT INTO participants (session_id, lead_id, friendly_name, identifier, proxy_identifier, proxy_identifier_sid)
                            VALUES ($1, $2, $3, $4, $5, $6)
                          RETURNING participant_id
                        `

    query(queryString, values, (err, results) => {
      if (err) {
        console.log('ERROR FROM ParticipantQueries.insert_lead_participant: ', err)
        rej(err)
      }
      const participant_id = results.rows[0].participant_id
      res({
        message: `Successfully created lead_participant (participant_id: ${participant_id}) , for lead (lead_id: ${lead.lead_id}), under session (session_id: ${session_id})`,
        session_id: session_id,
        lead: lead,
        participant_id: participant_id,
        identifier: identifier,
        proxy_identifier: proxy_identifier,
        proxy_identifier_sid: proxy_identifier_sid,
        proxy: {
          phoneNumber: proxy_identifier,
          sid: proxy_identifier_sid,
        }
      })
    })
  })
  return p
}

exports.get_participant_from_identifiers = (identifier, proxy_identifier) => {
  const p = new Promise((res, rej) => {
    const values = [identifier, proxy_identifier]
    const queryString = `SELECT * FROM participants
                            WHERE identifier = $1
                              AND proxy_identifier = $2
                              AND date_deleted IS NULL
                        `

    query(queryString, values, (err, results) => {
      if (err) {
        console.log(`ERROR FROM ParticipantQueries.get_participant_from_identifiers: `, err)
        rej(err)
      }
      res(results)
    })
  })
  return p
}

exports.get_other_participant = (session_id, participant_id) => {
  const p = new Promise((res, rej) => {
    const values = [session_id, participant_id]
    const queryString = `SELECT * FROM participants
                          WHERE session_id = $1
                            AND participant_id != $2
                            AND date_deleted IS NULL
                        `
    query(queryString, values, (err, results) => {
      if (err) {
        console.log(`ERROR FROM ParticipantQueries.get_other_participant: `, err)
        rej(err)
      }
      res(results)
    })
  })
  return p
}

exports.get_participant = (participant_id) => {
  const p = new Promise((res, rej) => {
    const values = [participant_id]
    const queryString = `SELECT * FROM participants
                          WHERE participant_id = $1
                            AND date_deleted IS NULL
                         `

    query(queryString, values, (err, results) => {
      if (err) {
        console.log(`ERROR FROM ParticipantQueries.get_participant: `, err)
        rej(err)
      }
      res(results)
    })
  })
  return p
}

exports.fallback = () => {
  const p = new Promise((res, rej) => {
    res({
      data: {
        rowCount: 0
      }
    })
  })
  return p
}
