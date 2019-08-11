var Product = require('../models/product')
var mongoose = require('mongoose')
mongoose.connect('mongodb://localhost/shopping', { useNewUrlParser: true })

var products = [
	new Product({
		imagePath:
			'https://dks.scene7.com/is/image/GolfGalaxy/18NIKWRMX270XXXXXLFS_Black_Cream?wid=1080&fmt=jpg',
		title: 'Nike ',
		description: 'Nike Airmax',
		price: 10
	}),
	new Product({
		imagePath:
			'https://dks.scene7.com/is/image/GolfGalaxy/19ADIMPLSBSTSLRRDMNS_Black_Solar_Red?wid=1080&fmt=jpg',
		title: 'Adidas',
		description: 'Best for running',
		price: 20
	}),
	new Product({
		imagePath:
			"https://images.unsplash.com/photo-1542291026-7eec264c27ff?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&w=1000&q=80",
		title: 'Nike',
		description: "Nike for Indoors",
		price: 40
	}),
	new Product({
		imagePath:
			'https://www.flightclub.com/media/catalog/product/cache/1/image/1600x1140/9df78eab33525d08d6e5fb8d27136e95/1/3/136354_01.jpg',
		title: 'Yeezy',
		description: 'Best for Fashion',
		price: 15
	}),
	new Product({
		imagePath:
			'https://dsw.scene7.com/is/image/DSWShoes/404995_001_ss_01?$pdp-image$',
		title: 'Vans',
		description: 'Best canvas shoes',
		price: 50
	})
]

var done = 0
for (var i = 0; i < products.length; i++) {
	products[i].save(function(err, result) {
		done++
		if (done === products.length) {
			exit()
		}
	})
}

function exit() {
	mongoose.disconnect()
}
