const moment = require('moment')
const twilio_client = require('../twilio_setup').generate_twilio_client()
const insertIntel = require('../DynamoDB/general_insertions').insertIntel
const CONVO_HISTORY = require('../DynamoDB/dynamodb_tablenames').CONVO_HISTORY
const initialMessage = require('./initial_message')
const SessionQueries = require('../Postgres/Queries/SessionQueries')
/*
    CONVO_HISTORY table structure
      - SES_MESSAGE_ID
      - TIMESTAMP
      - MEDIUM
      - MESSAGE
      - PROXY_CONTACT
      - PROXY_ID
      - RECEIVER_ID
      - RECEIVER_TYPE
      - RECEIVER_CONTACT
      - SENDER_ID
      - SENDER_TYPE
      - SENDER_CONTACT
*/

exports.send_initial_sms_to_staff_and_lead = (staff_participant, lead_participant, ad, messages) => {
  const p = new Promise((res, rej) => {

    send_sms_to_staff(staff_participant, messages.staff_message, lead_participant)
      .then((data) => {
        return send_sms_to_lead(lead_participant, messages.lead_message, staff_participant)
      })
      .then(() => {
        res({
          message: 'Successfully sent intial messages out.'
        })
      })
      .catch((err) => {
        console.log(`ERROR FROM smsAPI.send_initial_sms_to_staff_and_lead: `, err)
        rej(err)
      })

  })
  return p
}

const send_sms_to_staff = (staff_participant, body, lead_participant) => {
  const p = new Promise((res, rej) => {

    twilio_client.messages.create({
      body: body,
      to: staff_participant.identifier,
      from: staff_participant.proxy_identifier,
      // messagingServiceSid: messagingServiceSid // From a valid Twilio number
    })
    .then((message) => {
      // console.log(message)
        return insertIntel({
          'SES_MESSAGE_ID': message.sid,
          'TIMESTAMP': moment().format(),
          'MEDIUM': 'SMS',

          'MESSAGE': body,

          'PROXY_ID': staff_participant.session_id,
          'PROXY_CONTACT': staff_participant.proxy_identifier,

          'RECEIVER_ID': staff_participant.staff.staff_id,
          'RECEIVER_CONTACT': staff_participant.identifier,
          'RECEIVER_TYPE': 'STAFF_ID',

          'SENDER_ID': lead_participant.lead.lead_id,
          'SENDER_CONTACT': lead_participant.identifier,
          'SENDER_TYPE': 'LEAD_ID',

          'SESSION_ID': lead_participant.session_id
        }, CONVO_HISTORY)
    })
    .then(() => {
      res({
        message: `Successfully sent text message`
      })
    })
    .catch((err) => {
      console.log(`ERROR FROM smsAPI.send_sms_to_staff: `, err)
      rej(err)
    })
  })
  return p
}

const send_sms_to_lead = (lead_participant, body, staff_participant) => {
  const p = new Promise((res, rej) => {
    twilio_client.messages.create({
      body: body,
      to: lead_participant.identifier,
      from: lead_participant.proxy_identifier,
      // messagingServiceSid: messagingServiceSid // From a valid Twilio number
    })
    .then((message) => {
      return insertIntel({
        'SES_MESSAGE_ID': message.sid,
        'TIMESTAMP': moment().format(),
        'MEDIUM': 'SMS',

        'MESSAGE': body,

        'PROXY_ID': lead_participant.session_id,
        'PROXY_CONTACT': lead_participant.proxy_identifier,

        'RECEIVER_ID': lead_participant.lead.lead_id,
        'RECEIVER_CONTACT': lead_participant.identifier,
        'RECEIVER_TYPE': 'LEAD_ID',

        'SENDER_ID': staff_participant.staff.staff_id,
        'SENDER_CONTACT': staff_participant.identifier,
        'SENDER_TYPE': 'STAFF_ID',

        'SESSION_ID': lead_participant.session_id
      }, CONVO_HISTORY)
    })
    .then(() => {
      res({
        message: `Successfully sent text message`
      })
    })
    .catch((err) => {
      console.log(`ERROR FROM smsAPI.send_sms_to_lead: `, err)
      rej(err)
    })
  })
  return p
}

exports.forward_message = (sender, receiver, body) => {
  const p = new Promise((res, rej) => {
    const timestamp = moment().format()

    twilio_client.messages.create({
      body: body,
      to: receiver.identifier,
      from: receiver.proxy_identifier,
      // messagingServiceSid: messagingServiceSid // From a valid Twilio number
    })
      .then((message) => {
        return insertIntel({
          'SES_MESSAGE_ID': message.sid,
          'TIMESTAMP': timestamp,
          'MEDIUM': 'SMS',

          'MESSAGE': body,

          'PROXY_ID': sender.session_id,
          'PROXY_CONTACT': sender.proxy_identifier,

          'RECEIVER_ID': receiver.lead_id ? receiver.lead_id : receiver.staff_id,
          'RECEIVER_CONTACT': receiver.identifier,
          'RECEIVER_TYPE': receiver.lead_id ? 'LEAD_ID' : 'STAFF_ID',
          'RECEIVER_PROXY': receiver.proxy_identifier,

          'SENDER_ID': sender.staff_id ? sender.staff_id : sender.lead_id,
          'SENDER_CONTACT': sender.identifier,
          'SENDER_TYPE': sender.staff_id ? 'STAFF_ID' : 'LEAD_ID',
          'SENDER_PROXY': sender.proxy_identifier,

          'SESSION_ID': sender.session_id
        }, CONVO_HISTORY)
      })
      .then(() => {
        return SessionQueries.update_session_interaction(sender.session_id, timestamp)
      })
      .then((data) => {
        res(data)
      })
      .catch((err) => {
        console.log(`ERROR FROM sms_api.forward_message: `, err)
        rej(err)
      })
  })
  return p
}
