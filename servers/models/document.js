var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var User = require("./user");
var documentSchema = new Schema({
  _id: {
    type: Number,
    min: 100,
    required: true,
    default: 100,
    unique: true
  },
  ownerId: [{
    type: Number,
    ref: User
  }],
  documentName: {
    type: String,
    required: (true, "Document name is invalid")
  },
  title: {
    type: String,
    required: (true, " title is invalid")
  },
  content: {
    type: String,
    required: (true, " content is invalid")
  },
  dateCreated: {
    type: Date,
    default: Date.now
  },
  lastModified: {
    type: Date,
    default: Date.now
  }
}, {
  strict: true
});

documentSchema.statics.getMaxId = function() {
  var query = this.find({}, "_id");
  return new Promise(function(resolve, reject) {
    query.then(function(ids) {
        resolve(ids);
      },
      function(err) {
        reject(Error(err));
      });
  });
};

documentSchema.statics.getDocumentsByOwnerId = function(ownerId) {
  var query = this.find({
    ownerId: ownerId
  });
  return new Promise(function(resolve, reject) {
    query.then(function(docs) {
        resolve(docs);
      },
      function(err) {
        reject(Error(err));
      });
  });
};

documentSchema.statics.getDocumentsByDate = function(limit, date) {
  var startDate = new Date(date);
  var end = (new Date(date)).setDate(startDate.getDate() + 1);
  var endDate = new Date(end);
  var _query = {
    dateCreated: {
      $gt: startDate,
      $lt: endDate
    }
  };
  if (limit) _query.limit = limit;
  var query = this.find(_query);
  return new Promise(function(resolve, reject) {
    query.then(function(docs) {
        resolve(docs);
      },
      function(err) {
        reject(Error(err));
      });
  });
};

module.exports = mongoose.model('Documents', documentSchema);