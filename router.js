const twilio = require('twilio')
const bodyParser = require('body-parser')

// security
const Google_JWT_Check = require('./auth/googleJWTCheck').Google_JWT_Check
const originCheck = require('./auth/originCheck').originCheck

// routes
const Test = require('./routes/test_routes')
const ProxyRoutes = require('./routes/proxy_routes')
const SessionRoutes = require('./routes/session_routes')
const SMSRoutes = require('./routes/sms_routes')
const VoiceRoutes = require('./routes/voice_routes')
const PhoneNumberRoutes = require('./routes/phone_number_routes')

// bodyParser attempts to parse any request into JSON format
const json_encoding = bodyParser.json({type:'*/*'})
// bodyParser attempts to parse any request into GraphQL format
// const graphql_encoding = bodyParser.text({ type: 'application/graphql' })

module.exports = function(app){

	app.use(bodyParser())

	// tests
	app.get('/test', json_encoding, Test.test)
	app.get('/auth_test', [json_encoding, originCheck, Google_JWT_Check], Test.auth_test)
	// app.post('/buy_test', json_encoding, Test.buy_test)
	app.post('/lookup_number', json_encoding, Test.lookup_number)

	// SMS routes
	app.post('/proxy_connect_staff_and_lead', [json_encoding, originCheck, Google_JWT_Check], SMSRoutes.proxy_connect_staff_and_lead)
	app.post('/sms', [twilio.webhook({ validate: false })], SMSRoutes.sms_forwarder)
	app.post('/fallback', [twilio.webhook({ validate: false })], SMSRoutes.fallback)

	// Voice Routes
	app.post('/voice', [twilio.webhook({ validate: false })], VoiceRoutes.voice_forwarder)
	app.post('/dial_callback/session/:session_id/sender/:sender_id', VoiceRoutes.dial_callback)
	app.post('/recording_callback', [twilio.webhook({ validate: false })], VoiceRoutes.recording_callback)

	// Phone Routes
	app.post('/show_available_country_numbers', [json_encoding, originCheck, Google_JWT_Check], PhoneNumberRoutes.show_available_country_numbers)
	app.post('/buy_selected_number', [json_encoding, originCheck], PhoneNumberRoutes.buy_selected_number)

	// Proxy Routes
	app.post('/send_initial_message_from_assistant', [json_encoding, originCheck, Google_JWT_Check], ProxyRoutes.send_initial_message_from_assistant)
}
