var Role = require("./../servers/models/role");
var cmMethods = require("./helpers");
var roleKeys = ["title"];

var role_functions = {
  createRole: function(title) {
    var roleData = cmMethods.parseData(roleKeys, title);
    var query = Role.find({
      title: roleData.title
    });
    return cmMethods.genericCreate("Roles", roleData, Role, query);
  },

  getAllRoles: function(limit) {
    var query = Role.find({});
    if (limit) query = query.limit(limit);
    return cmMethods.genericGetAll("Roles", query);
  },

  getRole: function(id) {
     var query = Role.findOne({
      _id: id
    });
    return cmMethods.genericGetOne("Roles", query, id);
  },

  updateRole: function(roleData, id) {
    var query = Role.findByIdAndUpdate(id, roleData, {
      new: true
    });
    return cmMethods.genericUpdate("Roles", roleData, id, query);
  },

  deleteRole: function(id) {
    var query = Role.findByIdAndRemove(id);
    return cmMethods.genericDelete("Roles", query, id);
  }

};

module.exports = role_functions;