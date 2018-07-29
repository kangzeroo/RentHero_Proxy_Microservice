const twilio_client = require('../twilio_setup').generate_twilio_client()

const SessionQueries = require('../Postgres/Queries/SessionQueries')
const ParticipantAPI = require('./participant_api')


exports.create_session = (staff, lead, session) => {
  const p = new Promise((res, rej) => {
    let session_id, staff_participant, lead_participant

    console.log(`CREATING SESSION...`)
    SessionQueries.create_session(session.session_name, session.status, session.date_expiry)
      .then((data) => {
        console.log('SESSION CREATED, NOW ADD STAFF PARTICIPANT')
        console.log(data)
        session_id = data.session_id

        return ParticipantAPI.create_staff_participant(data.session_id, staff)
      })
      .then((data) => {
        console.log('STAFF PARTICIPANT CREATED, NOW ADD LEAD PARTICIPANT')
        console.log(data)
        staff_participant = data

        return ParticipantAPI.create_lead_participant(data.session_id, lead, data.proxy)
      })
      .then((data) => {
        console.log('LEAD PARTICIPANT CREATED, WE DONE!')
        console.log(data)
        lead_participant = data

        res({
          message: `Successfully created session ${data.session_id}`,
          session_id: data.session_id,
          staff_participant,
          lead_participant,
        })
      })
      .catch((err) => {
        console.log(`ERROR FROM SessionAPI.create_session: `, err)
        rej(err)
      })
  })
  return p
}
