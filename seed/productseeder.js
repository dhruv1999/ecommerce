var Product = require('../models/product')
var mongoose = require('mongoose')
mongoose.connect(
	'mongodb+srv://lifestyle19754:life1999@cluster0-cbyu1.mongodb.net/test?retryWrites=true&w=majority',
	{ useNewUrlParser: true }
)

var products = [
	new Product({
		imagePath:
			'https://dks.scene7.com/is/image/GolfGalaxy/18NIKWRMX270XXXXXLFS_Black_Cream?wid=1080&fmt=jpg',
		title: 'Nike ',
		description: 'Nike Airmax',
		price: 10,
		category: 'shoes'
	}),
	new Product({
		imagePath:
			'https://dks.scene7.com/is/image/GolfGalaxy/19ADIMPLSBSTSLRRDMNS_Black_Solar_Red?wid=1080&fmt=jpg',
		title: 'Adidas',
		description: 'Best for running',
		price: 20,
		category: 'shoes'
	}),
	new Product({
		imagePath:
			'https://images.unsplash.com/photo-1542272604-787c3835535d?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&w=1000&q=80',
		title: 'Jeans',
		description: 'Jeans',
		price: 40,
		category: 'jeans'
	}),
	new Product({
		imagePath:
			'http://images5.fanpop.com/image/photos/25400000/A-Calvin-Klein-Dress-Shirt-dress-shirts-25494139-800-854.jpg',
		title: 'Shirt',
		description: 'Formal Shirt',
		price: 15,
		category: 'shirt'
	}),
	new Product({
		imagePath:
			'https://rendering.documents.cimpress.io/v1/vp/preview?width=690&height=690&quality=80&scene=https://scenes.documents.cimpress.io/v1/scenes/1cce36d1-28e0-4ef5-9df9-6c2c1a756ae9',
		title: 'White T-shirt',
		description: 'Casual T-Shirt',
		price: 50,
		category: 'tshirt'
	}),
	new Product({
		imagePath:
			'http://assets.myntassets.com/assets/images/7149919/2018/9/27/68b78ee2-88f1-4700-87fa-2ceb40a292661538045112439-INVICTUS-Men-Black-Slim-Fit-Solid-Formal-Trousers-3491538045-1.jpg',
		title: 'Trouser',
		description: 'Formal Trouser',
		price: 50,
		category: 'trouser'
	})
]

products.forEach((product) => {
	product.save()
})
