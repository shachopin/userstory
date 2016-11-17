var mongoose = require('mongoose');

var Schema = mongoose.Schema;
var bcrypt = require('bcrypt-nodejs');

var UserSchema = new Schema({
  name: String,
  username: {type: String, required: true, index: {unique: true}},
  password: {type: String, required: true, select:false} //when we query user, we don't want to query password as well

});

UserSchema.pre('save', function(next){ //before save to the db
  var user = this;
  if(!user.isModified('password')) return next(); //go to the next matching route

  bcrypt.hash(user.password, null, null, function(err, hash) {
    if (err) return next(err); //go to the next matching route

    user.password = hash;
    next(); //go to the next matching route

  });
});

//custom method
UserSchema.methods.comparePassword = function(password) {
  var user = this;
  return bcrypt.compareSync(password, user.password);
}

module.exports = mongoose.model('User', UserSchema);
//this is like defining RoR model activeRecord class - ORM