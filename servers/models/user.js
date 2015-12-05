var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var Role = require("./role");
var userSchema = new Schema({
  _id: {
    type: Number,
    min: 100,
    required: true,
    unique: true,
    default: 100
  },
  username: {
    type: String,
    unique: true,
    required: (true, " username is invalid")
  },
  name: {
    first: {
      type: String,
      required: (true, " firstname is required")
    },
    last: {
      type: String,
      required: (true, " lastname is required")
    }
  },
  email: {
    type: String,
    unique: true,
    required: true,
    match: /.+\@.+\..+/,
    message: "Enter a valid email"
  },
  password: {
    type: String,
    required: true
  },
  role: [{
    type: Number,
    ref: 'Roles'
  }]
}, {
  strict: true
});

userSchema.statics.getMaxId = function() {
  var query = this.find({}, "_id");
  return new Promise(function(resolve, reject) {
    query.exec(function(err, ids) {
      if (err) reject(Error(err));
      resolve(ids);
    });
  });
};

module.exports = mongoose.model('Users', userSchema);