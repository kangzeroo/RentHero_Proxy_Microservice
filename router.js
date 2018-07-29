const bodyParser = require('body-parser')

// security
const Google_JWT_Check = require('./auth/googleJWTCheck').Google_JWT_Check
const originCheck = require('./auth/originCheck').originCheck

// routes
const Test = require('./routes/test_routes')
const LeadsRoutes = require('./routes/leads_routes')

// bodyParser attempts to parse any request into JSON format
const json_encoding = bodyParser.json({type:'*/*'})
// bodyParser attempts to parse any request into GraphQL format
// const graphql_encoding = bodyParser.text({ type: 'application/graphql' })

module.exports = function(app){

	// tests
	app.get('/test', json_encoding, Test.test)
	app.get('/auth_test', [json_encoding, originCheck, Google_JWT_Check], Test.auth_test)
	app.post('/email_test', [json_encoding, originCheck], Test.email_test)

	// leads
	app.post('/get_leads_for_corporation', [json_encoding, originCheck, Google_JWT_Check], LeadsRoutes.get_leads_for_corporation)
	app.post('/create_lead', [json_encoding, originCheck, Google_JWT_Check], LeadsRoutes.create_lead)
	app.post('/insert_lead_ad_sources', [json_encoding, originCheck, Google_JWT_Check], LeadsRoutes.insert_lead_ad_sources)
	app.post('/update_lead', [json_encoding, originCheck, Google_JWT_Check], LeadsRoutes.update_lead)
	app.post('/update_lead_details', [json_encoding, originCheck, Google_JWT_Check], LeadsRoutes.update_lead_details)
	app.post('/update_lead_ad_sources', [json_encoding, originCheck, Google_JWT_Check], LeadsRoutes.update_lead_ad_sources)

}
