const express = require('express');
const router = express.Router();
const Category = require('../models/category');



// ROUTE GET ALL THE CATEGORIES
router.get('/categories', (req, res, next) => {
    Category.find()
        .then((categories) => {
            res.json({ categories: categories });
        }).catch(err => res.json({ msg: "unable to fetch the categories." }));
});


// ROUTE to add categories
router.post('/categories', (req, res, next) => {
    let newCategory = new Category({
        name: req.body.name
    });
    newCategory
        .save()
        .then(category => res.json({ category: category, msg: "Category Saved Successfully" }))
        .catch(err => res.json({ err, msg: "Unable to save the category" }));
});

module.exports = router;