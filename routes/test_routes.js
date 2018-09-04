// GET /test
exports.test = function(req, res, next){
  res.json({
    message: "Test says alive and well"
  })
}

// POST /auth_test
exports.auth_test = function(req, res, next){
  res.json({
    message: "Auth test says alive and well"
  })
}

exports.buy_test = (req, res, next) => {
  require('../api/messaging_service_api').buy_new_number('CA', '647')
    .then((data) => {
      console.log(data)
    })
}

exports.lookup_number = (req, res, next) => {
  require('../api/lookup_api').lookup_number(req.body.number)
    .then((data) => {
      res.json(data)
    })
    .catch((err) => {
      console.log(err)
      res.status(500).send('Invalid Phone Number!')
    })
}
