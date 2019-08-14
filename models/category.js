let mongoose = require('mongoose');
let Schema = mongoose.Schema;

const categoriesSchema = new Schema({
    name: { type: String, required: true }
});

module.exports = mongoose.model('Category', categoriesSchema);
