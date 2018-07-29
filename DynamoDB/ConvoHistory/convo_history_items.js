const CONVO_HISTORY = require('../dynamodb_tablenames').CONVO_HISTORY


// ====================================

// THIS IS A TYPICAL FLOW OF EMAILS RECEIVED
exports.reference_items = [
  // A new email from a lead
  // LEAD --> PROXY (ie. leadXYZ@gmail.com --> heffe@renthero.ai)
  {
   'TableName': CONVO_HISTORY,
   'Item': {
     // AGENT_ID, LEAD_ID
     'SES_MESSAGE_ID': 'DSAFJLSDFJLSD',
     'SENDER_ID': 'adsfsdf-43ifhsdf-sdfho',
     'SENDER_CONTACT': 'agent@renthero.tech' || '5194673367',
     'SENDER_TYPE': 'AGENT_ID',
     'RECEIVER_ID': 'ljasdf-43g-dfgfs-sf',
     'RECEIVER_CONTACT': 'jlasjdf@kts.kijiji.ca' || '5194675467',
     'RECEIVER_TYPE': 'LEAD_ID',
     'TIMESTAMP': 'moment().toISOString()',
     'MEDIUM': 'EMAIL' || 'SMS',
     'PROXY_ID': 1,
     'PROXY_CONTACT': 'alsdjfl@flexximail.org',
     'MESSAGE': 'hello, this is the message'
   }
 }
]
