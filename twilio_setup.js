const path = require('path')
const pathToTwilioConfig = path.join(__dirname, './', 'credentials', process.env.NODE_ENV, 'twilio_config.json')
const twilio_config = require(pathToTwilioConfig)
const twilio = require('twilio')

exports.generate_twilio_client = () => {
  return new twilio(twilio_config.accountSid, twilio_config.authToken)
}

exports.get_proxy_messaging_service_sid = () => {
  return twilio_config.proxyMessageServiceSid
}
exports.get_numbers_messaging_service_sid = () => {
  return twilio_config.numbersMessageServiceSid
}
