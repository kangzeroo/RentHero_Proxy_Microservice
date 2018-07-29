const twilio_client = require('../twilio_setup').generate_twilio_client()

const SessionQueries = require('../Postgres/Queries/SessionQueries')
const ParticipantAPI = require('../api/participant_api')


exports.create_session = (req, res, next) => {
  const info = req.body
  const staff = info.staff        // REQUIRED: staff_id, phone, OPTIONAL: friendly_name
  const lead = info.lead          // REQUIRED: lead_id, phone, OPTIONAL: friendly_name
  const session_name = info.session_name
  const status = 'init'
  const date_expiry = info.date_expiry

  let session_id, staff_participant, lead_participant

  console.log(`CREATING SESSION...`)
  SessionQueries.create_session(session_name, status, date_expiry)
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

      res.json({
        message: 'Successfully created session',
        session_id: data.session_id,
      })
    })
    .catch((err) => {
      console.log(`ERROR FROM SessionRoutes.create_session: `, err)
      res.status(500).send('Failed to create session')
    })

}
