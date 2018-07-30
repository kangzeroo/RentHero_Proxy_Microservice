const twilio_client = require('../twilio_setup').generate_twilio_client();
const uuid = require('uuid')
const moment = require('moment')
const VoiceResponse = require('twilio').twiml.VoiceResponse;
const ParticipantQueries = require('../Postgres/Queries/ParticipantQueries')
const VoiceAPI = require('../api/voice_api')
const insertIntel = require('../DynamoDB/general_insertions').insertIntel
const CONVO_HISTORY = require('../DynamoDB/dynamodb_tablenames').CONVO_HISTORY

exports.voice_forwarder = function(req, res, next) {
  console.log('/voice_forwarder')

  let from = req.body.From
  let to   = req.body.To
  let body = req.body.Body

  let sender, receiver
  console.log(`From: ${from}, To: ${to}, Body: ${body}`)

  ParticipantQueries.get_participant_from_identifiers(from, to)
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

        console.log(`=== FORWARD CALL: session_id: ${receiver.session_id}, identifier: ${receiver.identifier}, proxy_identifier: ${receiver.proxy_identifier}`)

        return VoiceAPI.forward_call(sender, receiver)
      } else {
        console.log('=== INCORRECT ROW COUNT (STEP 2): ', data.rows)
      }
    })
    .then((voiceResponse) => {
      res.type('text/xml')
      res.send(voiceResponse.toString())
    })
    .catch((err) => {
      console.log(err)
    })

}


exports.voice_fallback = function(req, res, next) {
  const voiceResponse = new VoiceResponse()
  voiceResponse.say({
    voice: 'man',
    language: 'en',
  }, 'You are calling from an unrecognized number. Please send a message to this number of the property name')
  voiceResponse.hangup()
  res.type('text/xml')
  res.send(voiceResponse.toString())
}


exports.dial_callback = (req, res, next) => {
  // console.log(req.body)
  // console.log(req.params)
  const session_id = req.params.session_id
  const participant_id = req.params.sender_id
  console.log('SESSION_ID: ', session_id)
  console.log('PARTICIPANT_ID: ', participant_id)
  const callbackObj = req.body
  let sender, receiver

  ParticipantQueries.get_participant(participant_id)
    .then((data) => {
      sender = data.rows[0]
      console.log('==> SENDER: ', sender)

      return ParticipantQueries.get_other_participant(session_id, participant_id)
    })
    .then((data) => {
      receiver = data.rows[0]
      console.log('==> RECEIVER: ', receiver)

      update_session_interaction(session_id, moment().format())

      return insertIntel({
        'SES_MESSAGE_ID': callbackObj.CallSid,
        'TIMESTAMP': moment().format(),
        'MEDIUM': 'VOICE',

        'MESSAGE': callbackObj.RecordingUrl,

        'PROXY_ID': session_id,
        'PROXY_CONTACT': sender.proxy_identifier,

        'RECEIVER_ID': receiver.staff_id ? receiver.staff_id : receiver.lead_id,
        'RECEIVER_CONTACT': receiver.identifier,
        'RECEIVER_TYPE': receiver.staff_id ? 'STAFF_ID' : 'LEAD_ID',

        'SENDER_ID': sender.staff_id ? sender.staff_id : sender.lead_id,
        'SENDER_CONTACT': sender.identifier,
        'SENDER_TYPE': sender.staff_id ? 'STAFF_ID' : 'LEAD_ID',

        'META': JSON.stringify(callbackObj)
      }, CONVO_HISTORY)
    })
    .then((data) => {
      const response = new VoiceResponse();
      // response.say("I like big butts and I cannot lie");
      response.hangup();
      res.set('Content-Type', 'text/xml');
      res.send(response.toString())
    })
}

exports.recording_callback = (req, res, next) => {
  // console.log(req.body)

}
