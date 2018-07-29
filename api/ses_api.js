// AWS SES (Simple Email Service) for sending emails via Amazon
const AWS = require('aws-sdk/global')
AWS.config.loadFromPath('./credentials/production/aws_config.json');

const AWS_SES = require('aws-sdk/clients/ses')
const ses = new AWS_SES({
  region: 'us-east-1'
})

exports.generateInitialEmail = function(fromEmail, toEmail, message, header){
  const p = new Promise((res, rej) => {
		if (!toEmail || toEmail.length === 0) {
			rej('Missing from email, proxy email, or message')
		} else {
			const params = createInitialParams(fromEmail, toEmail, message, header)
			// console.log('Sending email with attached params!')
      console.log(AWS.config.credentials)
      AWS.config.credentials.refresh(function() {
				// console.log(AWS.config.credentials)
				ses.sendEmail(params, function(err, data) {
				  if (err) {
				  	 console.log('ERROR: ', err); // an error occurred
				  	 rej(err)
				  } else {
				  	console.log(data);           // successful response
  					res({
              message: 'Success! Initial mail sent',
              data: data,
            })
          }
				})
			})
		}
	})
	return p
}

function createInitialParams(fromEmail, toEmail, message, header){
  const params = {
	  Destination: { /* required */
	    BccAddresses: [
        'email.records.rentburrow@gmail.com'
      ],
	    CcAddresses: [],
	    ToAddresses: [
        toEmail
      ]
	  },
	  Message: { /* required */
	    Body: { /* required */
	      Html: {
	        Data: generateHTMLInquiryEmail_Landlord(toEmail, message),
	        Charset: 'UTF-8'
	      },
	    },
	    Subject: { /* required */
	      Data: header, /* required */
	      Charset: 'UTF-8'
	    }
	  },
	  Source: fromEmail,
	}
	return params
}

// generate the HTML email
function generateHTMLInquiryEmail_Landlord(toEmail, message){
	return `
		<!DOCTYPE html>
		<html>
		  <head>
		    <meta charset='UTF-8' />
		    <title>title</title>
		  </head>
		  <body>
		  	<p>${message}</p>
		  </body>
		</html>
	`
}
