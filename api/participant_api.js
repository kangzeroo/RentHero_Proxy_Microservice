const twilio_client = require('../twilio_setup').generate_twilio_client()
const ParticipantQueries = require('../Postgres/Queries/ParticipantQueries')

const MessagingAPI = require('./messaging_service_api')
const extract_area_code_from_national_format = require('./general_api').extract_area_code_from_national_format

const lookup_number = require('./lookup_api').lookup_number

/*
    CREATE STAFF PARTICIPANT
      1. Get all proxy_identifiers associated with this staff participant
      2. If the staff has no proxy_identifiers, select any number from the pool
      3. If the staff's number of proxy_identifiers is less than the number of phone numbers in the pool,
          then Select a proxy_identifier from the pool that is not already associated with the staff.
      4. Else, buy a new number form Twilio, and allocate this number to the staff participant
*/

exports.create_staff_participant = (session_id, staff) => {
  console.log(`CREATING staff_participant...`)
  console.log(`========== session_id: ${session_id}`)
  console.log(`========== staff_id: ${staff.staff_id}`)
  console.log(`========== staff_number: ${staff.phone}`)
  const p = new Promise((res, rej) => {
    let pool_numbers, staff_phone_obj

    lookup_number(staff.phone)
      .then((numberObj) => {
        staff_phone_obj = {
          countryCode: numberObj.countryCode,
          phoneNumber: numberObj.phoneNumber,
          nationalFormat: numberObj.nationalFormat,
          areaCode: extract_area_code_from_national_format(numberObj.nationalFormat).toString(),
        }

        return MessagingAPI.get_numbers_from_pool()
      })
      .then((numbers) => {
        pool_numbers = numbers

        // Step 1: get all proxy_identifiers associated with this staff_id
        return ParticipantQueries.get_active_participants_for_staff(staff.staff_id)
      })
      .then((results) => {
        if (results.rowCount === 0) {
          console.log(`==> Select any number from the pool`)

          // Select any number from the pool
          return pool_numbers[0]
        } else if (results.rowCount < pool_numbers.length) {
          console.log(`==> less proxy numbers for staff than pool numbers`)
          // TEST THIS

          const staff_proxy_identifiers = results.rows.map(row => row.proxy_identifier)

          // Select a proxy_identifier from the pool that is not already associated with the staff participant
          return pool_numbers.filter(val => !staff_proxy_identifiers.includes(val.phoneNumber))[0]
        } else {
          console.log('==> more proxy numbers for staff than pool numbers')
          // Buy a new number from twilio, and allocate this number to the staff participant
          return MessagingAPI.buy_new_number(staff_phone_obj.countryCode, staff_phone_obj.areaCode)
        }
      })
      .then((selected_number) => {
        console.log('SELECTED_PROXY_IDENTIFIER: ', selected_number)

        // insert into participants
        return ParticipantQueries.insert_staff_participant(session_id, staff, staff_phone_obj.phoneNumber, selected_number.phoneNumber, selected_number.sid)
      })
      .then((data) => {
        res(data)
      })
      .catch((err) => {
        console.log('ERROR FROM ParticipantAPI.create_staff_participant: ', err)
        rej(err)
      })
  })
  return p
}

/*
  CREATING A LEAD PARTICIPANT
    1. If staff's proxy identifier is not used in any of the lead's sessions,
       then use the same proxy identifier as the staff.
    2. Else If lead's unique proxy identifiers is less than the numbers in the pool,
       then select a number from the pool that is not used in any of these sessions
    3. Else buy a new twilio number and allocate to the lead participant
*/

exports.create_lead_participant = (session_id, lead, staff_participant_proxy) => {
  console.log(`CREATING lead_participant...`)
  console.log(`========== session_id: ${session_id}`)
  console.log(`========== lead_id: ${lead.lead_id}`)
  console.log(`========== lead_number: ${lead.phone}`)
  // console.log(`========== staff_proxy_identifier: ${staff_participant_proxy.phoneNumber}`)
  const p = new Promise((res, rej) => {
    let pool_numbers, lead_phone_obj

    lookup_number(lead.phone)
      .then((numberObj) => {
        lead_phone_obj = {
          countryCode: numberObj.countryCode,
          phoneNumber: numberObj.phoneNumber,
          nationalFormat: numberObj.nationalFormat,
          areaCode: extract_area_code_from_national_format(numberObj.nationalFormat).toString(),
        }

        return MessagingAPI.get_numbers_from_pool()
      })
      .then((numbers) => {
        pool_numbers = numbers

        // Step 1: get all proxy_identifiers associated with this number
        return ParticipantQueries.get_active_participants_for_lead(lead.lead_id)
      })
      .then((results) => {
        if (results.rowCount === 0) {
          console.log(`==> No active sessions for this lead, use staff_proxy_identifier`)

          // Select the staff participant proxy_identifier
          // return staff_participant_proxy
          return pool_numbers[0]
        } else if (results.rowCount < pool_numbers.length) {

          // // If the staff's proxy identifier is used in the lead_participant's active session
          // if (results.rows.filter(row => row.proxy_identifier === staff_participant_proxy.phoneNumber).length > 0) {
          //   console.log(`==> staff_proxy_identifier is already being used this lead participant in a session, choose another proxy_identifier from the pool!`)
            const lead_proxy_identifiers = results.rows.map(row => row.proxy_identifier)

            // Select a proxy_identifier from the pool that is not already associated with the lead_participants
            return pool_numbers.filter(val => !lead_proxy_identifiers.includes(val.phoneNumber))[0]
          // } else {
          //   console.log(`==> staff_proxy_identifier is not being used for this lead participant in a session, use staff_proxy_identifier`)
          //   return staff_participant_proxy
          // }
        } else {
          console.log(`==> more proxy numbers for lead than pool numbers`)
          // Buy a new number from twilio, and allocate this number to the lead_participant
          return MessagingAPI.buy_new_number(lead_phone_obj.countryCode, lead_phone_obj.areaCode)
        }
      })
      .then((selected_number) => {
        console.log('SELECTED_PROXY_IDENTIFIER: ', selected_number)

        // insert into participants
        return ParticipantQueries.insert_lead_participant(session_id, lead, lead_phone_obj.phoneNumber, selected_number.phoneNumber, selected_number.sid)
      })
      .then((data) => {
        res(data)
      })
      .catch((err) => {
        console.log('ERROR FROM ParticipantAPI.create_lead_participant: ', err)
        rej(err)
      })
  })
  return p
}
