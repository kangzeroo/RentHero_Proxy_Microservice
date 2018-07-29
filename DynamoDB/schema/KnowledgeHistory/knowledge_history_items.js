const KNOWLEDGE_HISTORY = require('../dynamodb_tablenames').KNOWLEDGE_HISTORY


// ====================================
//
//

// THIS IS A TYPICAL FLOW OF EMAILS RECEIVED
exports.reference_items = [
  // A new email from a lead
  // LEAD --> PROXY (ie. leadXYZ@gmail.com --> heffe@renthero.ai)
  {
    'TableName': KNOWLEDGE_HISTORY,
    'Item': {
      'USER_EMAIL': 'leadXYZ@gmail.com',
      'HISTORY_ID': 'uuid.v4()',
      'REGULAR_MESSAGE_ID': '9rwfhds.sad89@mail.outlook.com',
      'SES_MESSAGE_ID': 'S3KEY_CADDSFODJFSDF',
      'AD_ID': 'ad_id' || 'unknown',
      'ROLE': 'to' || 'from' || 'cc' || 'fwd' || 'replyto',
      'TIMESTAMP': 'moment().toISOString()',
      'PROXY_EMAIL': 'heffe@renthero.ai'
    }
  },
  // A new reply from agent to lead
  // AGENT --> PROXY (ie. agentABC@gmail.com --> heffe@renthero.ai)
  {
    'TableName': KNOWLEDGE_HISTORY,
    'Item': {
      'USER_EMAIL': 'agentABC@gmail.com',
      'HISTORY_ID': 'uuid.v4()',
      'REGULAR_MESSAGE_ID': '9rwfhds.sad89@mail.outlook.com',
      'SES_MESSAGE_ID': 'S3KEY_CADDSFODJFSDF',
      'AD_ID': 'ad_id' || 'unknown',
      'ROLE': 'to' || 'from' || 'cc' || 'fwd' || 'replyto',
      'TIMESTAMP': 'moment().toISOString()',
      'PROXY_EMAIL': 'heffe@renthero.ai'
    }
  }
]
