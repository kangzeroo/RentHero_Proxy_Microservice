const Promise = require('bluebird')
const { promisify } = Promise
const pool = require('../db_connect')
const uuid = require('uuid')
const moment = require('moment')

// to run a query we just pass it to the pool
// after we're done nothing has to be taken care of
// we don't have to return any client to the pool or close a connection

const query = promisify(pool.query)

exports.get_leads_for_corporation = (corporation_id) => {
  const p = new Promise((res, rej) => {
    const values = [corporation_id]
    const queryString = `SELECT a.lead_id, a.first_name, a.last_name,
                                a.email, a.phone, a.thumbnail, a.channel_email,
                                a.created_at, a.updated_at,
                                b.ad_ids,
                                c.notes, c.sources
                           FROM leads a
                           LEFT OUTER JOIN (
                             SELECT lead_id, corporation_id, JSON_AGG(ad_id) AS ad_ids
                               FROM ad_leads
                               WHERE corporation_id = $1
                               GROUP BY lead_id, corporation_id
                           ) b
                           ON a.lead_id = b.lead_id
                           LEFT OUTER JOIN lead_details c
                           ON a.lead_id = c.lead_id
                           INNER JOIN (
                             SELECT corporation_id, lead_id
                               FROM ad_leads
                               GROUP BY corporation_id, lead_id
                           ) d
                           ON a.lead_id = d.lead_id
                           WHERE c.corporation_id = $1
                              OR d.corporation_id = $1
                        `

    query(queryString, values, (err, results) => {
      if (err) {
        console.log(err)
        rej('Failed to get leads')
      }
      res(results)
    })
  })
  return p
}


exports.create_lead = (lead, corporation_id, creator) => {
  const p = new Promise((res, rej) => {
    query('BEGIN', (err) => {
      if (err) {
        console.log('BEGIN ERROR: ', err)
        rej('Failed to save lead')
      }
      const lead_id = uuid.v4()
      console.log('====LEAD_ID: ', lead_id)
      const values = [lead_id, lead.first_name, lead.last_name, lead.email, lead.phone]
      const insertLead = `INSERT INTO leads (lead_id, first_name, last_name, email, phone)
                               VALUES ($1, $2, $3, $4, $5)
                          ON CONFLICT (email)
                          DO UPDATE SET first_name = $2,
                                        last_name = $3,
                                        phone = $4,
                                        updated_at = CURRENT_TIMESTAMP
                          RETURNING *
                          `
      query(insertLead, values, (err, results) => {
        if (err) {
          console.log('ERROR: ', err)
          rej('Failed to save lead')
        }
        const new_lead = results.rows[0]
        const values2 = [lead_id, lead.lead_notes, JSON.stringify(lead.lead_sources), corporation_id]
        const insertDetails = `INSERT INTO lead_details (lead_id, notes, sources, corporation_id)
                                    VALUES ($1, $2, $3, $4)
                                    ON CONFLICT (lead_id, corporation_id)
                                    DO UPDATE SET notes = $2,
                                                  sources = $3,
                                                  updated_at = CURRENT_TIMESTAMP
                                RETURNING *
                                `
        query(insertDetails, values2, (err, results) => {
          if (err) {
            console.log('ERROR: ', err)
            rej('Failed to save lead')
          }
          const values3 = [lead_id, creator.id_type, creator.id]
          const insertCreator = `INSERT INTO lead_creator (lead_id, id_type, id)
                                      VALUES ($1, $2, $3)
                                      ON CONFLICT (lead_id) DO NOTHING
                                `

          query(insertCreator, values3, (err, results) => {
            if (err) {
              console.log(err)
              rej("Failed to save lead")
            }
            query('COMMIT', (err) => {
              if (err) {
                console.log('ERROR: ', err)
                rej('Failed to save lead')
              }
              res({
                message: 'Succesfully saved lead',
                new_lead: {
                  lead_id: lead_id,
                  first_name: lead.first_name,
                  last_name: lead.last_name,
                  email: lead.email,
                  phone: lead.phone,
                  created_at: new_lead.created_at,
                  updated_at: new_lead.updated_at,
                  notes: lead.notes,
                  lead_sources: lead.sources,
                }
              })
            })
          })
        })
      })
    })
  })
  return p
}

exports.insert_lead_ad_sources = (corporation_id, ad_sources, lead_id) => {
  const p = new Promise((res, rej) => {
    const arrayOfPromises = ad_sources.map((ad_id) => {
      const values = [corporation_id, ad_id, lead_id]
      const insertRow = `INSERT INTO ad_leads (corporation_id, ad_id, lead_id)
                              VALUES ($1, $2, $3)
                              ON CONFLICT (ad_id, lead_id)
                              DO UPDATE SET updated_at = CURRENT_TIMESTAMP
                        `

      return query(insertRow, values)
    })

    Promise.all(arrayOfPromises)
      .then((data) => {
        res({
          message: 'Successfully saved lead',
          ad_ids: ad_sources,
        })
      })
      .catch((err) => {
        console.log(err)
        rej('Failed to save ad sources')
      })
  })
  return p
}

exports.remove_lead_ad_sources = (corporation_id, ad_sources, lead_id) => {
  const p = new Promise((res, rej) => {
    const arrayOfPromises = ad_sources.map((ad_id) => {
      const values = [corporation_id, ad_id, lead_id]
      const removeRow = `DELETE FROM ad_leads
                               WHERE corporation_id = $1
                                 AND ad_id = $2
                                 AND lead_id = $3
                        `

      return query(removeRow, values)
    })

    Promise.all(arrayOfPromises)
      .then((data) => {
        return get_lead(lead_id, corporation_id)
      })
      .then((data) => {
        res({
          message: 'Successfully updated lead',
          updated_lead: data.lead,
        })
      })
      .catch((err) => {
        console.log(err)
        rej('Failed to update lead')
      })
  })
  return p
}

const get_lead = (lead_id, corporation_id) => {
  const p = new Promise((res, rej) => {
    const values = [lead_id, corporation_id]
    const getLead = `SELECT a.lead_id, a.first_name, a.last_name,
                                a.email, a.phone, a.thumbnail,
                                a.created_at, a.updated_at,
                                b.ad_ids,
                                c.notes, c.sources
                           FROM leads a
                           LEFT OUTER JOIN (
                             SELECT lead_id, corporation_id, JSON_AGG(ad_id) AS ad_ids
                               FROM ad_leads
                               WHERE lead_id = $1
                                 AND corporation_id = $2
                               GROUP BY lead_id, corporation_id
                           ) b
                           ON a.lead_id = b.lead_id
                           LEFT OUTER JOIN lead_details c
                           ON a.lead_id = c.lead_id
                           WHERE a.lead_id = $1
                      `

    query(getLead, values, (err, results) => {
      if (err) {
        console.log(err)
        rej('Failed to get lead')
      }
      res({
        message: 'Successfully got lead',
        lead: results.rows[0],
      })
    })
  })
  return p
}


exports.update_lead = (lead) => {
  const p = new Promise((res, rej) => {
    const values = [lead.lead_id, lead.first_name, lead.last_name, lead.email, lead.phone]
    const updateLead = `UPDATE leads
                           SET first_name = $2,
                               last_name = $3,
                               email = $4,
                               phone = $5,
                               updated_at = CURRENT_TIMESTAMP
                         WHERE lead_id = $1
                       `

    query(updateLead, values, (err, results) => {
      if (err) {
        console.log(err)
        rej('Failed to update lead')
      }
      get_lead(lead.lead_id, lead.corporation_id)
        .then((data) => {
          res({
            message: 'Successfully updated lead',
            updated_lead: data.lead,
          })
        })
        .catch((err) => {
          console.log(err)
          rej('Failed to update lead')
        })

    })
  })
  return p
}

exports.update_lead_details = (lead_id, notes, sources, corporation_id) => {
  const p = new Promise((res, rej) => {
    const values = [lead_id, notes, sources, corporation_id]
    const updateLead = `UPDATE lead_details
                           SET notes = $2,
                               sources = $3,
                               updated_at = CURRENT_TIMESTAMP
                        WHERE lead_id = $1
                          AND corporation_id = $4
                       `

      query(updateLead, values, (err, results) => {
        if (err) {
          console.log(err)
          rej('Failed to update lead details')
        }
        get_lead(lead_id, corporation_id)
          .then((data) => {
            console.log(data)
            res({
              message: 'Successfully updated lead details',
              updated_lead: data.lead,
            })
          })
          .catch((err) => {
            console.log(err)
            rej('Failed to update lead details')
          })
      })
  })
  return p
}
