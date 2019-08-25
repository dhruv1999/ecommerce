var Category = require('../models/category')

// Mongodb Connection
var mongoose = require('mongoose')
mongoose.connect(
	'mongodb+srv://lifestyle19754:life1999@cluster0-cbyu1.mongodb.net/test?retryWrites=true&w=majority',
	{ useNewUrlParser: true }
)

const categories = [
	new Category({
		name: 'tshirt'
	}),
	new Category({
		name: 'shirt'
	}),
	new Category({
		name: 'trouser'
	}),
	new Category({
		name: 'jeans'
	}),
	new Category({
		name: 'shoes'
	})
]

categories.forEach((category) => {
	category.save()
})

console.log('Categories Seeded')
