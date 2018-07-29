const twilio_client = require('../twilio_setup').generate_twilio_client()
const create_lead_participant = require('../api/participant_api').create_lead_participant

exports.send_message = (req, res, next) => {
  twilio_client.messages
  .create({
     body: 'This is the ship that made the Kessel Run in fourteen parsecs?',
     from: '+16479301673',
     to: '+16475286355'
   })
  .then(message => {

  })
  .done();
}


/* message response object

  accountSid: 'AC3cfc4b5a78368f2cdb70baf2c945aee7',
  apiVersion: '2010-04-01',
  body: 'This is the ship that made the Kessel Run in fourteen parsecs?',
  dateCreated: 2018-07-29T08:06:55.000Z,
  dateUpdated: 2018-07-29T08:06:55.000Z,
  dateSent: null,
  direction: 'outbound-api',
  errorCode: null,
  errorMessage: null,
  from: '+16479301673',
  messagingServiceSid: null,
  numMedia: '0',
  numSegments: '1',
  price: null,
  priceUnit: 'USD',
  sid: 'SM17dc1e8863d34b1491a31f679273b114',
  status: 'queued',
  subresourceUris: { media: '/2010-04-01/Accounts/AC3cfc4b5a78368f2cdb70baf2c945aee7/Messages/SM17dc1e8863d34b1491a31f679273b114/Media.json' },
  to: '+16475286355',
  uri: '/2010-04-01/Accounts/AC3cfc4b5a78368f2cdb70baf2c945aee7/Messages/SM17dc1e8863d34b1491a31f679273b114.json',
*/

exports.insert_lead_participant = (req, res, next) => {

  create_lead_participant('adasdasda', '6475286355')


}
