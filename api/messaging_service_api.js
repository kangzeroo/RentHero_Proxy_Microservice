const twilio_client = require('../twilio_setup').generate_twilio_client()
const messagingServiceSid = require('../twilio_setup').get_proxy_messaging_service_sid()

exports.get_numbers_from_pool = () => {
  const p = new Promise((res, rej) => {
    const service = twilio_client.messaging.services(messagingServiceSid)
    service.phoneNumbers.list()
      .then((numbers) => {
        // console.log(numbers)
        res(numbers)
      })
      .catch((err) => {
        console.log(err)
        rej(err)
      })
  })
  return p
}

exports.buy_new_number = (country_code, area_code) => {
  console.log(`==== BUYING A NEW NUMBER WITH country_code: ${country_code}, and area_code: ${area_code}`)
  const p = new Promise((res, rej) => {

    let purchasedTwilioNumber

    twilio_client.availablePhoneNumbers(country_code)
      .local.list({
        areaCode: area_code,
        smsEnabled: true,
        mmsEnabled: true,
        voiceEnabled: true,
      })
      .then((data) => {
        if (data && data.length > 0) {
          console.log('===> NUMBER FOUND IN ROUND 1')
          const number = data[0]
          console.log('=== SELECTED NUMBER: ', number)
          purchasedTwilioNumber = number
          return twilio_client.incomingPhoneNumbers.create({
            phoneNumber: number.phoneNumber,
            voiceUrl: 'https://rentheros.com:7104/voice',
          })
        } else {
          return twilio_client.availablePhoneNumbers(country_code)
            .local.list({
              smsEnabled: true,
              mmsEnabled: true,
              voiceEnabled: true,
            })
              .then((data) => {
                console.log('===> NUMBER FOUND IN ROUND 2')
                const number = data[0]
                console.log('=== SELECTED NUMBER: ', number)
                purchasedTwilioNumber = number
                return twilio_client.incomingPhoneNumbers.create({
                  phoneNumber: number.phoneNumber,
                  voiceUrl: 'https://rentheros.com:7104/voice',
                })
              })
        }
      })
      .then((purchasedNumber) => {
        // console.log('PURCHASED NUMBER: ', purchasedNumber)
        const service = twilio_client.messaging.services(messagingServiceSid)
        return service.phoneNumbers.create({
          phoneNumberSid: purchasedNumber.sid,
        })
      })
      .then((data) => {
        console.log('DATA: ', data)
        console.log('PURCHASED NUMBER: ', {
          sid: purchasedTwilioNumber.sid,
          phoneNumber: purchasedTwilioNumber.phoneNumber,
        })
        res(data)
      })
      .catch((err) => {
        console.log(err)
        rej(err)
      })

  })
  return p
}
