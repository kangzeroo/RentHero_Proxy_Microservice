const twilio_client = require('../twilio_setup').generate_twilio_client()
const messagingServiceSid = require('../twilio_setup').get_numbers_messaging_service_sid()


exports.lookup_number = (number) => {
  // console.log('lookup: ', number)
  const p = new Promise((res, rej) => {
    twilio_client.lookups.phoneNumbers(number)
              .fetch()
              .then((numberObj) => {
                // console.log(numberObj)
                res(numberObj)
              })
              .catch((err) => {
                console.log(err)
                rej(err)
              })
  })
  return p
}

exports.show_available_country_numbers = (country_code, contains) => {
  const p = new Promise((res, rej) => {
    twilio_client.availablePhoneNumbers(country_code)
    .local.list({
      contains: contains,
      smsEnabled: true,
      mmsEnabled: true,
      voiceEnabled: true,
    })
    .then((data) => {
      // console.log(data)
      res({
        numbers: data.map((number) => {
          return {
            friendlyName: number.friendlyName,
            phoneNumber: number.phoneNumber,
            locality: number.locality,
            region: number.region,
            isoCountry: number.isoCountry,
          }
        }),
      })
    })
    .catch((err) => {
      console.log(err)
      rej(err)
    })
  })
  return p
}

exports.buy_selected_number = (corporation_id, selected_number) => {
  console.log(`==== BUYING A NEW NUMBER: ${selected_number}`)
  const p = new Promise((res, rej) => {
    let purchasedTwilioNumber

    twilio_client.incomingPhoneNumbers.create({
      friendlyName: `Proxy For Corp:${corporation_id}`,
      phoneNumber: selected_number,
      voiceUrl: '',
    })
    .then((purchasedNumber) => {
      console.log(purchasedNumber)
      purchasedTwilioNumber = purchasedNumber
      const service = twilio_client.messaging.services(messagingServiceSid)
      return service.phoneNumbers.create({
        phoneNumberSid: purchasedNumber.sid,
      })
    })
    .then((data) => {
      res({
        message: `Succesfully bought number ${purchasedTwilioNumber.phoneNumber}`,
        purchasedNumber: purchasedTwilioNumber,
      })
    })
    .catch((err) => {
      console.log(err)
      rej(`Failed to buy phone number: ${selected_number}`)
    })
  })
  return p
}
