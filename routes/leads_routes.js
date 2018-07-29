const uuid = require('uuid')
const LeadsQueries = require('../Postgres/Queries/LeadsQueries')

exports.get_leads_for_corporation = (req, res, next) => {
  const info = req.body

  LeadsQueries.get_leads_for_corporation(info.corporation_id)
    .then((data) => {
      res.json(data.rows)
    })
    .catch((err) => {
      console.log(err)
      res.status(500).send(err)
    })
}

exports.create_lead = (req, res, next) => {
  const info = req.body

  LeadsQueries.create_lead(info.lead, info.corporation_id, info.creator)
    .then((data) => {
      res.json({
        message: data.message,
        new_lead: data.new_lead,
      })
    })
    .catch((err) => {
      console.log(err)
      res.status(500).send(err)
    })
}

exports.insert_lead_ad_sources = (req, res, next) => {
  const info = req.body

  LeadsQueries.insert_lead_ad_sources(info.corporation_id, info.ad_sources, info.lead_id)
    .then((data) => {
      res.json({
        message: data.message,
        ad_ids: data.ad_ids,
      })
    })
    .catch((err) => {
      console.log(err)
      res.status(500).send(err)
    })
}

exports.update_lead = (req, res, next) => {
  const info = req.body

  LeadsQueries.update_lead(info)
    .then((data) => {
      res.json({
        message: data.message,
        updated_lead: data.updated_lead,
      })
    })
    .catch((err) => {
      console.log(err)
      res.status(500).send(err)
    })
}

exports.update_lead_details = (req, res, next) => {
  const info = req.body

  LeadsQueries.update_lead_details(info.lead_id, info.notes, info.sources, info.corporation_id)
    .then((data) => {
      res.json({
        message: data.message,
        updated_lead: data.updated_lead,
      })
    })
    .catch((err) => {
      console.log(err)
      res.status(500).send(err)
    })

}

exports.update_lead_ad_sources = (req, res, next) => {
  const info = req.body

  LeadsQueries.insert_lead_ad_sources(info.corporation_id, info.ads_to_add, info.lead_id)
    .then((data) => {
      console.log(data)
      return LeadsQueries.remove_lead_ad_sources(info.corporation_id, info.ads_to_delete, info.lead_id)
    })
    .then((data) => {
      res.json({
        message: data.message,
        updated_lead: data.updated_lead,
      })
    })
    .catch((err) => {
      console.log(err)
      res.status(500).send(err)
    })
}
