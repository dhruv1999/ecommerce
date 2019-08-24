let mongoose = require('mongoose')
let Schema = mongoose.Schema

var orderSchema = new Schema({
	user: { type: Schema.Types.ObjectId, ref: 'User' },
	cart: { type: Object, required: true },
	name: { type: String, required: true },
	email: { type: String, required: true },
	phone: { type: String, required: true },
	address: { type: String, required: true },
	paymentId: { type: String, required: true },
	paymentRequestId: { type: String, required: true },
	created_at: { type: Date, default: Date.now() }
})

module.exports = mongoose.model('Order', orderSchema)
