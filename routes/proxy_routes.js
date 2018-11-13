const moment = require('moment')
const uuid = require('uuid')
const twilio_client = require('../twilio_setup').generate_twilio_client()

const insertIntel = require('../DynamoDB/general_insertions').insertIntel
const CONVO_HISTORY = require('../DynamoDB/dynamodb_tablenames').CONVO_HISTORY

exports.send_initial_message_from_assistant = (req, res, next) => {
  const info = req.body
  const proxy_id = info.proxy_id
  const proxy_phone = info.proxy_phone
  const proxy_email = info.proxy_email
  const staff_id = info.staff_id
  const staff_phone = info.staff_phone
  const staff_name = info.staff_name

  const msgBody = `Hello ${staff_name}, this is your RentHero Assistant's number. You can message or call your assistant here.
                   Text or email leads to ${proxy_email}, or use our contact info on your marketing materials.
                   If you have any listings, you can email your assistant the URLs!`

  twilio_client.messages
  .create({
     body: msgBody,
     from: proxy_phone,
     to: staff_phone,
   })
   .then((message) => {
     return insertIntel({
       'SES_MESSAGE_ID': uuid.v4(),
       'TIMESTAMP': moment().format(),
       'MEDIUM': 'SMS',

       'MESSAGE': msgBody,

       'PROXY_ID': proxy_id,
       'PROXY_CONTACT': proxy_phone,

       'RECEIVER_ID': staff_id,
       'RECEIVER_CONTACT': staff_phone,
       'RECEIVER_TYPE': 'STAFF_ID',

       'SENDER_ID': proxy_id,
       'SENDER_CONTACT': proxy_phone,
       'SENDER_TYPE': 'PROXY_ID',
     }, CONVO_HISTORY)
   })
   .then(() => {
     res.json({
       message: `Successfully sent text message`
     })
   })
   .catch((err) => {
     console.log(`ERROR FROM smsAPI.send_sms_to_lead: `, err)
     res.status(500).send('Failed to send initial message')
   })
}
