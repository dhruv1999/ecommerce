var Category = require('../models/category');

// Mongodb Connection
var mongoose = require('mongoose')
mongoose.connect('mongodb://localhost/shopping', { useNewUrlParser: true })



const categories = [
    new Category({
        name: 'tshirt'
    }),
    new Category({
        name: 'shirt'
    }),
    new Category({
        name: 'trousers'
    }),
    new Category({
        name: 'formals'
    }),
    new Category({
        name: 'jeans'
    })
];

categories.forEach(category => {
    category.save();
});

console.log('Categories Seeded');