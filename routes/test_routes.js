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

exports.email_test = function(req, res, next) {
  require('../api/ses_api').generateInitialEmail('jimmy@renthero.cc', 'jimmehguoo@gmail.com', 'Hi, yes this is available. Plz hurry up', 'Response for Ad')
    .then((data) => {
      console.log(data)
      res.json({
        message: 'email successfully sent'
      })
    })
    .catch((err) => {
      console.log(err)
    })
}
