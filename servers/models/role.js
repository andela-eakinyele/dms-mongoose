var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var roleSchema = new Schema({
  _id : {
     type: Number,
    min: 1,
    required: true,
    default: 1,
    unique: true
  },
   title: {
    type: String,
    unique : true,
    required: (true, " title is invalid")
  }
});

roleSchema.statics.getMaxId = function() {
  var query = this.find({}, "_id");
  return new Promise(function(resolve, reject) {
    query.exec(function(err, ids) {
      console.log(err, ids);
      if (err) reject(Error(err));
      resolve(ids);
    });
  });
};

module.exports = mongoose.model('Roles', roleSchema);
