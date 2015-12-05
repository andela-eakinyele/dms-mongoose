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
      }]);

    return new Promise(function(resolve, reject) {
      Role.findOne({
        title: userData.role
      }).then(function(_role) {
        console.log(_role);
          if (_role) {
            userData.role = _role._id
            resolve(cmMethods.genericCreate("Users", userData, User, query));
          } else {
            console.log("Role does not exist");
            cmMethods.dberrors(reject, "Invalid role specified", userData.role + " does not exist");
          }
        },
        function(err) {
          console.log("querying database", err);
          cmMethods.dberrors(reject, "querying database", err);
        });
    });
  },

  getAllUsers: function(limit) {
    var query = User.find({});
    if (limit) query = query.limit(limit);
    return cmMethods.genericGetAll("Users", query);
  },

  getUser: function(id) {
    var query = User.findOne({
      _id: id
    }).populate({
      path: 'role'
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