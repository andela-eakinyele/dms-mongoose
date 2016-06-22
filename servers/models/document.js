var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var User = require("./user");
var Role = require("./role");
var _ = require("lodash")

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
    ref: 'Users'
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
  role: [{
    type: Number,
    ref: 'Roles'
  }],
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
  }).populate({
    path: 'ownerId',
    select: 'username'
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
  // var startDate = new Date(date);
  // var end = (new Date(date)).setDate(startDate.getDate() + 1);
  // var endDate = new Date(end);
  var _query = {
    dateCreated: {
      $lt: new Date(date),
      $gt: new Date(new Date(date) - 24 * 60 * 60 * 1000)
    }
  };
  var st = new Date(date);
  var edt = new Date(new Date(date) - 24 * 60 * 60 * 1000);
  var query = this.find({}).where('dateCreated').gt(st).lt(edt).populate({
    path: 'ownerId',
    select: 'username'
  });
  if (limit) {
    query = query.limit(limit);
  }
  return new Promise(function(resolve, reject) {
    query.then(function(docs) {
        console.log(docs);
        resolve(docs);
      },
      function(err) {
        reject(Error(err));
      });
  });
};

documentSchema.statics.getDocumentsByRole = function(limit, role) {
  var roles = role.split(", ");
  var doc = this;
  return new Promise(function(resolve, reject) {
    Role.find({}).where('title').in(roles).select("_id").then(function(arrRoles) {
      if (arrRoles.length) {
        arrRoles = _.pluck(arrRoles, "_id");
        var query = doc.find().where('role').in(arrRoles).populate({
          path: 'role',
          select: "title"
        });
        if (limit) {
          query = query.limit(limit);
        }
        query.then(function(docs) {
            resolve(docs);
          },
          function(err) {
            reject(Error(err));
          });
      } else {
        resolve();
      }
    });
  });
};

module.exports = mongoose.model('Documents', documentSchema);