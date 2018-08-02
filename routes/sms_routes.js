const moment = require('moment')
const SessionAPI = require('../api/session_api')
const SessionQueries = require('../Postgres/Queries/SessionQueries')
const ParticipantQueries = require('../Postgres/Queries/ParticipantQueries')
const TourQueries = require('../Postgres/Queries/TourQueries')
const SMSAPI = require('../api/sms_api')
const MessagingResponse = require('twilio').twiml.MessagingResponse;


exports.proxy_connect_staff_and_lead = (req, res, next) => {
  const info = req.body
  const staff = info.staff        // REQUIRED: staff_id, phone, OPTIONAL: friendly_name
  const lead = info.lead          // REQUIRED: lead_id, phone, OPTIONAL: friendly_name
  const ad = info.ad              // REQUIRED: ad_title, formatted_address, short_address OPTIONAL: ad_unit
  const messages = info.messages  // REQUIRED: lead_message, staff_message
  const tour = info.tour          // REQUIRED: tour_begin, tour_end
  const corporation_id = info.corporation_id  // REQUIRED

  const session = {
    session_name: info.session_name,
    status: 'init',
    date_expiry: info.date_expiry,
  }

  let session_id

  // CREATE SESSION FIRST
  SessionAPI.create_session(staff, lead, session, corporation_id)
    .then((data) => {
      console.log(data.message)
      session_id = data.session_id

      SessionQueries.update_session_start(data.session_id, moment().format())

      // send SMS to both lead and staff
      return SMSAPI.send_initial_sms_to_staff_and_lead(data.staff_participant, data.lead_participant, ad, messages)
    })
    .then((data) => {
      return TourQueries.insert_tour(session_id, ad, tour, lead.friendly_name, staff.friendly_name)
    })
    .then((data) => {
      console.log(data.message)
      res.json(data)
    })
    .catch((err) => {
      console.log(`ERROR FROM sms_routes.proxy_connect_staff_and_lead: `, err)
      res.status(500).send('Failed to send create tour')
    })
}


/*
    SMS_FORWARDER
      parameters: From, To, Body
      1. get an active participant with the same From and To, and then determine who to send this to.
      2.

*/

exports.sms_forwarder = function(req, res, next) {
  console.log('/sms_forwarder')
  const twiml_client = new MessagingResponse();

  console.log(req.body)

  // const twiml_client = new MessagingResponse();

  let original_from = req.body.From
  let twilio_to   = req.body.To
  let body = req.body.Body

  let sender, receiver

  console.log(`From: ${original_from}, To: ${twilio_to}, Body: ${body}`)


  ParticipantQueries.get_participant_from_identifiers(original_from, twilio_to)
    .then((data) => {
      if (data.rowCount === 1) {
        console.log('=== CORRECT ROW COUNT (STEP 1)')
        sender = data.rows[0]

        return ParticipantQueries.get_other_participant(sender.session_id, sender.participant_id)
      } else {
        console.log('=== INCORRECT ROW COUNT (STEP 1): ', data.rows)
      }
    })
    .then((data) => {
      if (data.rowCount === 1) {
        console.log('=== CORRECT ROW COUNT (STEP 2)')
        receiver = data.rows[0]

        return SMSAPI.forward_message(sender, receiver, body)
      } else {
        console.log('=== INCORRECT ROW COUNT (STEP 2): ', data.rows)
      }
    })
    .then((data) => {
      res.type('text/xml');
      res.send(twiml_client.toString())
    })
    .catch((err) => {
      console.log(err)
    })
}


exports.fallback = (req, res, next) => {
  console.log(req.body)
}
