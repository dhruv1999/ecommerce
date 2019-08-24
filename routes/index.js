var express = require('express')
var router = express.Router()
var Product = require('../models/product')
var Order = require('../models/order')
const csrf = require('csurf')
var Cart = require('../models/cart')
var Insta = require('instamojo-nodejs')
const { sendSuccessOrder } = require('../models/sms')
const { sendOrderEmail } = require('../models/email')

const csrfProtection = csrf()
router.use(csrfProtection)

router.get('/', function(req, res, next) {
	var successMsg = req.flash('success')[0]
	Product.find(function(err, docs) {
		var productChunks = []
		var chunkSize = 3
		for (var i = 0; i < docs.length; i += chunkSize) {
			productChunks.push(docs.slice(i, i + chunkSize))
		}
		res.render('shop/index', {
			title: 'Shopping Cart',
			products: productChunks,
			successMsg: successMsg,
			noMessages: !successMsg
		})
	})
})

router.get('/add-to-cart/:id', function(req, res, next) {
	var productId = req.params.id
	var cart = new Cart(req.session.cart ? req.session.cart : {})

	Product.findById(productId, function(err, product) {
		if (err) {
			return res.redirect('/')
		}
		cart.add(product, product.id)
		req.session.cart = cart
		console.log(req.session.cart)
		res.redirect('/')
	})
})

router.post('/add-to-cart', (req, res, next) => {
	let productId = req.body.id
	let cart = new Cart(req.session.cart ? req.session.cart : {})
	Product.findById(productId, (err, product) => {
		if (err) {
			return res.json(err)
		}
		cart.add(product, product.id)
		req.session.cart = cart
		// console.log(req.session.cart);
		return res.json({ success: true, product: product })
	})
})

router.get('/add/:id', (req, res, next) => {
	let productId = req.params.id
	let cart = new Cart(req.session.cart ? req.session.cart : {})
	Product.findById(productId, (err, product) => {
		if (err) {
			return res.redirect('/shopping-cart')
		}
		cart.add(product, product.id)
		req.session.cart = cart
		// console.log(req.session.cart);
		res.redirect('/product.hbs')
	})
})

router.get('/shopping-cart', function(req, res, next) {
	if (!req.session.cart) {
		return res.render('shop/shopping-cart', { products: null })
	}
	var cart = new Cart(req.session.cart)
	res.render('shop/shopping-cart', {
		products: cart.generateArray(),
		totalPrice: cart.totalPrice
	})
})

router.get('/products/:category', (req, res, next) => {
	const category = req.params.category
	Product.find({ category: category })
		.then((products) => {
			let productChunks = []
			let chunkSize = 3
			for (let i = 0; i < products.length; i += chunkSize) {
				productChunks.push(products.slice(i, i + chunkSize))
			}
			res.render('shop/index', {
				category: category,
				title: 'Shopping Cart',
				products: productChunks
			})
		})
		.catch((err) => res.json({ msg: 'There are no products of this category' }))
})

router.post('/product/search', (req, res, next) => {
	query = req.body.query
	// Query Builder need to be updated
	/*
		Search for Full Text
		.find({ $text: { $search: query } })
	*/

	Product.find({
		$or: [
			{ name: { $regex: new RegExp(query), $options: 'i' } },
			{ category: { $regex: new RegExp(query), $options: 'i' } },
			{ description: { $regex: new RegExp(query), $options: 'i' } },
			{ title: { $regex: new RegExp(query), $options: 'i' } }
		]
	})
		.then((product) => {
			return res.json({ products: product, success: true })
		})
		.catch((err) => {
			return res.json({ msg: 'Unable to fetch the products', err: true })
		})
})

router.get('/product', (req, res, next) => {
	res.render('shop/product')
})

router.get('/product/:id', (req, res, next) => {
	Product.findOne({ _id: req.params.id })
		.then((product) => {
			// Check for the bestseller

			// Check for the new

			// Check for the Original Price

			// Check for the Latest Price

			// Check for the Discount

			// return res.json({ product });
			res.render('shop/product', {
				product: product,
				title: 'Shopping Cart'
			})
		})
		.catch((err) => console.log(err))
})

router.post('/add-to-cart', (req, res, next) => {
	let productId = req.body.id
	let cart = new Cart(req.session.cart ? req.session.cart : {})
	Product.findById(productId, (err, product) => {
		if (err) {
			return res.json(err)
		}
		cart.add(product, product.id)
		req.session.cart = cart
		// console.log(req.session.cart);
		return res.json({ success: true, product: product })
	})
})

router.get('/add/:id', (req, res, next) => {
	let productId = req.params.id
	let cart = new Cart(req.session.cart ? req.session.cart : {})
	Product.findById(productId, (err, product) => {
		if (err) {
			return res.redirect('/shopping-cart')
		}
		cart.add(product, product.id)
		req.session.cart = cart
		// console.log(req.session.cart);
		res.redirect('/shopping-cart')
	})
})

router.get('/reduce/:id', function(req, res, next) {
	var productId = req.params.id
	var cart = new Cart(req.session.cart ? req.session.cart : {})

	cart.reduceByOne(productId)
	req.session.cart = cart
	res.redirect('/shopping-cart')
})

router.get('/remove/:id', function(req, res, next) {
	var productId = req.params.id
	var cart = new Cart(req.session.cart ? req.session.cart : {})

	cart.removeItem(productId)
	req.session.cart = cart
	res.redirect('/shopping-cart')
})

router.get('/checkout', isLoggedIn, (req, res, next) => {
	if (!req.session.cart) {
		return res.redirect('/shopping-cart')
	}
	let cart = req.session.cart
	res.render('shop/checkout', {
		csrfToken: req.csrfToken(),
		total: cart.totalPrice
	})
})

router.post('/checkout-pay', isLoggedIn, (req, res, next) => {
	// Insta Mojo Intialization
	Insta.setKeys(
		'test_7d1bcb8115a0348a605d91ea3ee',
		'test_fadbc5315f09559a42086bcc5dc'
	)
	// Initialize Payment Data
	let data = new Insta.PaymentData()
	Insta.isSandboxMode(true)
	data.purpose = req.body.purpose
	data.name = req.body.name
	data.address = req.body.address
	data.phone = req.body.phone
	data.email = req.body.email
	data.amount = req.body.total
	data.send_email = false
	data.allow_reapeated_payment = false
	data.setRedirectUrl('http://localhost:3000/payment-success')

	Insta.createPayment(data, (error, response) => {
		if (error) {
			// if there is any error with the payments then we can redirect ot the server not responding page
			req.flash('error', error.message)
			let errMsg = req.flash('error')[0]
			res.render('shop/post-checkout', { errMsg: errMsg, Errors: false })
		} else {
			// Payment redirection link at response.payment_request.longurl
			const responseData = JSON.parse(response)
			// Get the payment URL where to redirect the user
			req.session.name = req.body.name
			req.session.phone = req.body.phone
			req.session.address = req.body.address
			req.session.email = req.body.email
			console.log(responseData)
			const redirectUrl = responseData.payment_request.longurl
			res.redirect(redirectUrl)
		}
	})
})

/*
  Redirect URL From the Instamojo to recive the payment ID and 
  store the cart items with payment success ID in the pyaments 
  collectein and destroy the cart items and then redirect to 
  generated invoice page.
  */
router.get('/payment-success', isLoggedIn, (req, res, next) => {
	payment_Id = req.query.payment_id
	payment_request_Id = req.query.payment_request_id
	// Getting  all Data from the Payment Gateway
	req.flash('success', 'Successfully bought the products')
	// Saving all the data to the Database
	var order = new Order({
		user: req.user,
		cart: req.session.cart,
		name: req.session.name,
		email: req.session.email,
		phone: req.session.phone,
		address: req.session.address,
		paymentId: payment_Id,
		paymentRequestId: payment_request_Id
	})
	// Unset the session Address, Name, Email and Phone and Also Cart Item

	// Storing the cart object
	order.save((err, result) => {
		// Redirect user to the User Profile and Shopping Details Page with the Success message
		sendSuccessOrder(
			order.name,
			Object.values(order.cart.items)[0].item.title,
			order.phone
		)
		sendOrderEmail(
			order.name,
			Object.values(order.cart.items)[0].item.title,
			order.email
		)
		var sccMsg = req.flash('success')[0]
		res.render('shop/post-checkout', { sccMsg: sccMsg, noErrors: true })
	})
})

module.exports = router

function isLoggedIn(req, res, next) {
	if (req.isAuthenticated()) {
		return next()
	}
	// old Url Field sends the the user to the current page where it was
	req.session.oldUrl = req.url
	res.redirect('/user/login')
}
