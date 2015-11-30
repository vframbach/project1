var mongoose = require('mongoose');
	Schema = mongoose.Schema;

var UserSchema = new Schema({
	task: String,
	description: String
});

var User = mongoose.model('User', UserSchema);

module.exports = User;