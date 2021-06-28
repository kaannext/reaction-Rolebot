const mongoose = require('mongoose');

const schema = new mongoose.Schema({
guild: String,
message: String,
role: String,
emoji: String
});

module.exports = mongoose.model('Reaction', schema);