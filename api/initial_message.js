
exports.generate_initial_lead_message = (lead, staff, message, ad, msg) => {
  const p = new Promise((res, rej) => {
    let hello = `Hello ${lead.friendly_name}, this is ${staff.friendly_name}, `
    let admsg = `the leasing agent for ${ad.ad_title ? `${ad.ad_title}${ad.ad_unit ? ` (Unit ${ad.ad_unit})` : ''} at ${ad.formatted_address}` : ad.formatted_address }. `
    let tourmsg = `Let's set up a tour time here! ${msg ? msg : ''}`

    if (message) {
      res(hello + admsg + tourmsg + message)
    } else {
      res(hello + admsg + tourmsg)
    }
  })
  return p
}

exports.generate_intial_staff_message = (lead, staff, message, ad) => {
  const p = new Promise((res, rej) => {
    let hello = `Hello ${staff.friendly_name}, this is ${lead.friendly_name}, `
    let admsg = `I'm interested in ${ad.ad_title ? `${ad.ad_title}${ad.ad_unit ? ` (Unit ${ad.ad_unit})` : ''} at ${ad.formatted_address}` : ad.formatted_address }. `
    let tourmsg = `Let's set up a tour time here! `

    if (message) {
      res(hello + admsg + tourmsg + message)
    } else {
      res(hello + admsg + tourmsg)
    }
  })
  return p
}
