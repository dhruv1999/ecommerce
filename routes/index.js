var express = require('express')
var router = express.Router()
var Product = require('../models/product')

var Cart = require('../models/cart')


router.get('/', function (req, res, next) {
	var successMsg = req.flash('success')[0];
	Product.find(function (err, docs) {
		var productChunks = [];
		var chunkSize = 3;
		for (var i = 0; i < docs.length; i += chunkSize) {
			productChunks.push(docs.slice(i, i + chunkSize));
		}
		res.render('shop/index', { title: 'Shopping Cart', products: productChunks, successMsg: successMsg, noMessages: !successMsg });
	});
});

router.get('/add-to-cart/:id', function (req, res, next) {
	var productId = req.params.id;
	var cart = new Cart(req.session.cart ? req.session.cart : {});

	Product.findById(productId, function (err, product) {
		if (err) {
			return res.redirect('/');
		}
		cart.add(product, product.id);
		req.session.cart = cart;
		console.log(req.session.cart);
		res.redirect('/');
	});
});

router.get('/shopping-cart', function(req, res, next) {
	if (!req.session.cart) {
		return res.render('shop/shopping-cart', {products: null});
	} 
	 var cart = new Cart(req.session.cart);
	 res.render('shop/shopping-cart', {products: cart.generateArray(), totalPrice: cart.totalPrice});
 });


 router.get('/products/:category', (req, res, next) => {
	const category = req.params.category;
	Product.find({ category: category })
	  .then(products => {
		let productChunks = [];
		let chunkSize = 3;
		for (let i = 0; i < products.length; i += chunkSize) {
		  productChunks.push(products.slice(i, i + chunkSize));
		}
		res.render('shop/index', {
		  category: category,
		  title: 'Shopping Cart',
		  products: productChunks
		});
	  })
	  .catch(err => res.json({ msg: 'There are no products of this category' }));
  });



  router.post('/product/search', (req, res, next) => {
	query = req.body.query;
	// Query Builder need to be updated
	/*
		Search for Full Text
		.find({ $text: { $search: query } })
	*/
  
	Product
	  .find({ $or: [{ name: { $regex: new RegExp(query), "$options": "i" } }, { category: { $regex: new RegExp(query), "$options": "i" } }, { description: { $regex: new RegExp(query), "$options": "i" } },{ title: { $regex: new RegExp(query), "$options": "i" } }] })
	  .then(product => {
		return res.json({ products: product, success: true })
	  })
	  .catch(err => {
		return res.json({ msg: "Unable to fetch the products", err: true });
	  });
  });

  router.get('/product',(req,res,next)=>{
	  res.render('shop/product')
  })



  router.get('/product/:id', (req, res, next) => {
	Product.findOne({ _id: req.params.id })
	  .then(product => {
  
		// Check for the bestseller
  
		// Check for the new
  
		// Check for the Original Price
  
		// Check for the Latest Price
  
		// Check for the Discount
  
		// return res.json({ product });
		res.render('shop/product', {
		  product: product,
		  title: 'Shopping Cart',
		  
		});
	  })
	  .catch(err => console.log(err));
  });
module.exports = router
