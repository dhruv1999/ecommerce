const sgMail = require('@sendgrid/mail')



sgMail.setApiKey(process.env.SENDGRID_API_KEY)

const sendWelcomeEmail = (email) => {
	sgMail.send({
		to: email,
		from: 'dhruvparmar160@gmail.com',
		subject: 'Thanks for joining in!',
		text: `Welcome to the LifeStyle Store . Let me know how you get along with our website.This website is created by Dhruv, Sahil and Aashutosh`
	})
}

const sendCancelEmail = (email) => {
	sgMail.send({
		to: email,
		from: 'dhruvparmar160@gmail.com',
		subject: 'Thanks for joining in!',
		text: `GoodBye  See you soon`
	})
}


module.exports = {
	sendWelcomeEmail,
	sendCancelEmail
}