const moment = require('moment')
const VoiceResponse = require('twilio').twiml.VoiceResponse;
const insertIntel = require('../DynamoDB/general_insertions').insertIntel
const CONVO_HISTORY = require('../DynamoDB/dynamodb_tablenames').CONVO_HISTORY
const twilio_client = require('../twilio_setup').generate_twilio_client();


exports.forward_call = (sender, receiver) => {
  const p = new Promise((res, rej) => {
    if (sender && receiver && receiver.identifier && receiver.proxy_identifier) {
      console.log('CORRECT PARAMETER, DIALING...')
      const voiceResponse = new VoiceResponse()
      // voiceResponse.say({
      //   voice: 'man',
      //   language: 'en',
      // },
      //  'this call may be recorded for quality and training purposes'
      // )

      const dial = voiceResponse.dial({
        callerId: receiver.proxy_identifier,
        record: 'record-from-answer',
        action: '/dial_callback/session/' + sender.session_id + '/sender/' + sender.participant_id,
        // recordingStatusCallback: 'https://b71d1a47.ngrok.io/recording_callback'
      })
      dial.number(receiver.identifier)

      res(voiceResponse)
    } else {
      const voiceResponse = new VoiceResponse()

      voiceResponse.say({
        voice: 'man',
        language: 'en',
      }, `Sorry, I'm unsure who you're trying to call.`)

      voiceResponse.hangup();

      res(voiceResponse)
    }

  })
  return p
}
