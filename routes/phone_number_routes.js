const twilio_client = require('../twilio_setup').generate_twilio_client();
const LookupAPI = require('../api/lookup_api')
const ProxyQueries = require('../Postgres/Queries/ProxyQueries')

exports.show_available_country_numbers = (req, res, next) => {
  const info = req.body
  const country_code = info.country_code
  const contains = info.contains

  LookupAPI.show_available_country_numbers(country_code, contains)
    .then((data) => {
      res.json(data)
    })
    .catch((err) => {
      console.log(err)
      res.status(500).send('Failed to show numbers')
    })
}

exports.buy_selected_number = (req, res, next) => {
  const info = req.body
  let boughtRes

  LookupAPI.buy_selected_number(info.corporation_id, info.selected_number)
    .then((data) => {
      boughtRes = data

      return ProxyQueries.update_proxy_number(info.proxy_id, data.purchasedNumber.phoneNumber)
    })
    .then((data) => {
      res.json(boughtRes)
    })
    .catch((err) => {
      console.log(err)
      rej(err)
    })
}
