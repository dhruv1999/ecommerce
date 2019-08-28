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

/* GET home page. */
router.get('/', (req, res, next) => {
	// Get All Products
	Product.find((err, docs) => {
		let productChunks = []
		let chunkSize = 3
		for (let i = 0; i < docs.length; i += chunkSize) {
			productChunks.push(docs.slice(i, i + chunkSize))
		}

		// Get all hot arrivals

		// Get all Bestsellers

		res.render('shop/index', {
			page: 'home',
			title: 'Shopping Cart',
			csrfToken: req.csrfToken(),
			products: productChunks
		})
	})
})

// POST Request for Product Search
// Get all products by matching names
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

// GET Product Page
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
				title: 'Shopping Cart',
				csrfToken: req.csrfToken()
			})
		})
		.catch((err) => console.log(err))
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
		process.env.API_KEY,
		process.env.AUTH_KEY
		
	)
	// Initialize Payment Data
	let data = new Insta.PaymentData()

	data.purpose = req.body.purpose
	data.name = req.body.name
	data.address = req.body.address
	data.phone = req.body.phone
	data.email = req.body.email
	data.amount = req.body.total
	data.send_email = false
	data.allow_reapeated_payment = false
	data.setRedirectUrl(
		'https://afternoon-cove-98863.herokuapp.com/payment-success'
	)

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

router.get('/payment-success', isLoggedIn, (req, res, next) => {
	payment_Id = req.query.payment_id
	payment_request_Id = req.query.payment_request_id
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
	req.session.name = null
	req.session.phone = null
	req.session.address = null
	req.session.cart = null
	// Storing the cart object
	order.save((err, result) => {
		sendSuccessOrder(
			order.name,
			Object.values(order.cart.items)[0].item.title,
			order.cart.totalQty,
			order.cart.totalPrice,
			order.phone
		)
		sendOrderEmail(
			order.name,
			Object.values(order.cart.items)[0].item.title,
			order.cart.totalQty,
			order.cart.totalPrice,
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
	res.redirect('/user/signin')
}
