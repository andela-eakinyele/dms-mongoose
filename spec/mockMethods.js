var Promise = require("bluebird");
var _ = require("lodash");
var mongoose = require("mongoose");

var ModelFunc = require("./../documentManager");
var testdata = require("./testData.json");
var User = require("./../servers/models/user");
var Document = require("./../servers/models/document");
var Role = require("./../servers/models/role");

function roleMock(testRoles) {
  return Promise.mapSeries(testRoles, function(role) {
    return ModelFunc.roles.createRole(role.split(", "));
  });
}

function userMock(testUsers) {
  return Promise.mapSeries(_.values(testUsers), function(userdata) {
    return ModelFunc.users.createUser(userdata);
  });
}

function docMock(testDocs) {
  return Promise.mapSeries(_.values(testDocs), function(doc) {
    return ModelFunc.docs.createDocument(doc);
  });
}

var connect = function() {
  mongoose.connect('mongodb://localhost/test', function(err, conn) {
    if (err) {
      console.log("Unable to connect", err);
      return;
    }
    console.log('Connected to database');
  });
};

var deleteModels = function(cb) {
  User.remove().exec(function(err) {
    if (err) {
      console.log("Users not removed");
      return
    }
    Role.remove().exec(function(err) {
      if (err) {
        console.log("Roles not removed");
        return
      }
      Document.remove().exec(function(err) {
        if (err) {
          console.log("Users not removed");
          return
        }
        console.log("All removed");
        cb();
      });
    });
  });
};

var stripDataValues = function(results) {
  return _.map(results, function(result) {
    return result.data;
  });
}

var isStringLen = function(args) {
  return _.every(args, function(arg) {
    var first = typeof arg.first === 'string' && arg.first.length > 0;
    var last = typeof arg.last === 'string' && arg.last.length > 0;
    return first && last;
  });
};

var isDate = function(args) {
  return _.every(args, function(arg) {
    return new Date(arg) instanceof Date;
  });
}

var populateMock = function(cb) {
  roleMock(testdata.testRoles).then(function(a) {
    userMock(testdata.testUsers).then(function(b) {
      docMock(testdata.testDocs).then(function(c) {
        var roles = stripDataValues(a);
        var users = stripDataValues(b);
        var docs = stripDataValues(c);
        cb([roles, users, docs]);
      }).catch(function(err) {
        console.log("Error mocking documents", err);
        cb();
      });
    }).catch(function(err) {
      console.log("Error mocking users", err);
      cb();
    });
  }).catch(function(err) {
    console.log("Error mocking roles", err);
    cb();
  });
};

module.exports = {
  connect: connect,
  dropDB: deleteModels,
  populateMock: populateMock,
  isStringLen: isStringLen,
  isDate: isDate
}