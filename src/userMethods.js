var User = require("./../servers/models/user");
var Role = require("./../servers/models/role");

var cmMethods = require("./helpers");
var userKeys = ["name.first", "name.last", "username", "password", "role", "email"];

var user_functions = {
  createUser: function(_userData) {
    var userData = cmMethods.parseData(userKeys, _userData);
    // query definition for existing user data
    var query = User.find({}).or(
      [{
        email: userData.email
      }, {
        username: userData.username
      }]).select("username name");

    return new Promise(function(resolve, reject) {
      Role.findOne({
        title: userData.role
      }).then(function(_role) {
          if (_role) {
            userData.role = _role._id
            resolve(cmMethods.genericCreate("Users", userData, User, query));
          } else {
            resolve({
              "status": false,
              "message": "Invalid role specified '" + userData.role + "'' does not exist",
              "data": ""
            });
          }
        },
        function(err) {
          cmMethods.dberrors(reject, "querying database", err);
        });
    });
  },

  getAllUsers: function(limit) {
    var query = User.find({}).select("username email role name").populate({
      path: 'role',
      select: 'title'
    });
    if (limit) query = query.limit(limit);
    return cmMethods.genericGetAll("Users", query);
  },

  getUser: function(id) {
    var query = User.findOne({
      _id: id
    }).select("username email role name").populate({
      path: 'role',
      select: 'title'
    });
    return cmMethods.genericGetOne("Users", query, id);
  },

  updateUser: function(userData, id) {
    var query = User.findByIdAndUpdate(id, userData, {
      new: true
    });
    return cmMethods.genericUpdate("Users", userData, id, query);
  },

  deleteUser: function(id) {
    var query = User.findByIdAndRemove(id);
    return cmMethods.genericDelete("Users", query, id);
  }
}

module.exports = user_functions;