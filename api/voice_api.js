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

      // if (receiver.staff_id) {
      //   voiceResponse.say({
      //     voice: 'man',
      //     language: 'en'
      //   },
      //     `Call from ${sender.friendly_name} about ${tourData.short_address}`
      //   )
      // }

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

exports.call_fallback = () => {
  console.log('!!! CALL_FALLBACK')
  const p = new Promise((res, rej) => {
    const voiceResponse = new VoiceResponse()
    voiceResponse.say({
      voice: 'man',
      language: 'en'
    },
      `We're sorry, we cannot determine who you are trying to dial.`
    )

    voiceResponse.hangup()
    res(voiceResponse)
  })
  return p
}
