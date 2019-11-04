const sgMail = require('@sendgrid/mail')

sgMail.setApiKey(process.env.SENDGRID_API_KEY)

const sendWelcomeEmail = (email, name) => {
	sgMail.send({
		to: email,
		from: 'aashutosh.j@somaiya.edu',
		subject: 'Thanks for joining in!',
		text: `${name}, Welcome to the LifeStyle Store . Let me know how you get along with our website.This website is created by Dhruv, Sahil and Aashutosh`
	})
}

const sendCancelEmail = (email) => {
	sgMail.send({
		to: email,
		from: 'aashutosh.j@somaiya.edu',
		subject: 'Thanks for joining in!',
		text: `${name}, GoodBye  See you soon`
	})
}

const sendOrderEmail = (name, ordername, quantity, price, email) => {
	sgMail.send({
		to: email,
		from: 'aashutosh.j@somaiya.edu',
		subject: 'Your order is successfully placed.',
		text: `${name},your order for ${ordername}, Quantity:${quantity} for Price:Rs ${price} is successfully placed.`
	})
}

module.exports = {
	sendWelcomeEmail,
	sendCancelEmail,
	sendOrderEmail
}
