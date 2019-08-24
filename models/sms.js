const accountSid = 'ACe7e6928173b6c6d073d56bc195f1bdcb'
const authToken = 'cb9f43af590dd727951a2754c08c4986'
const client = require('twilio')(accountSid, authToken)

const sendWelcomeSms = (name, number) => {
	client.messages.create({
		body: `${name}, Welcome to LifeStyle Store.`,
		from: '+13218004066',
		to: `+91${number}`
	})
}

const sendSuccessOrder = (name, ordername, quantity, price, number) => {
	client.messages.create({
		body: `${name},your order for ${ordername}, Quantity-${quantity} for Price-Rs ${price} is successfully placed.`,
		from: '+13218004066',
		to: `+91${number}`
	})
}

module.exports = { sendWelcomeSms, sendSuccessOrder }
