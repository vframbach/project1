var mongoose = require('mongoose');
	Schema = mongoose.Schema;
	passportLocalMongoose = require('passport-local-mongoose');

var UserSchema = new Schema({
	username: String,
	password: String

});

var validatePassword = function (password, callback) {
	if (password.length < 6) {
		return callback({ code: 422, message: 'Password must be atleast 6 characters.' });
	}
	return callback(null);
};

UserSchema.plugin(passportLocalMongoose, {
	passwordValidator: validatePassword
});

var User = mongoose.model('User', UserSchema);

module.exports = User;