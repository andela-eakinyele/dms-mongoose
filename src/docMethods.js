var Doc = require("./../servers/models/document");
var User = require("./../servers/models/user");
var Role = require("./../servers/models/role");
var _ = require("lodash");

var cmMethods = require("./helpers");
var docKeys = ["username", "documentName", "title", "content", "role"];
var typeArray = ["txt", "js", "json", "jsx", "doc"];

var doc_functions = {
  createDocument: function(_docData) {
    var docData = cmMethods.parseData(docKeys, _docData);
    // query for existing document
    var query = Doc.find({
      title: docData.title
    });
    // get OwnerId
    return new Promise(function(resolve, reject) {
      var validType = typeArray.filter(function(type) {
        var regex = new RegExp("(\\." + type + ")$");
        return regex.test(docData.documentName);
      });
      if (validType.length !== 1) {
        resolve({
          "status": false,
          "message": "No role entered '",
          "data": ""
        });
        return;
      }
      var roles = docData.role.split(", ");
      if (!roles.length) {
        resolve({
          "status": false,
          "message": "No roles specified'",
          "data": ""
        });
        return;
      }
      roles.push("Admin");
      Role.find({}).where('title').in(roles).select("_id").then(function(arrRoles) {
        if (arrRoles.length) {
          arrRoles = _.pluck(arrRoles, "_id");
          User.findOne()
            .where('username').equals(docData.username)
            .where('role').in(arrRoles)
            .select("_id").then(function(user) {
                if (user) {
                  docData.ownerId = user._id;
                  docData.role = arrRoles;
                  resolve(cmMethods.genericCreate("Documents", docData, Doc, query));
                } else {
                  // console.log("Role/Username does not exist", docData.username, docData.role);
                  resolve({
                    "status": false,
                    "message": "Invalid User/Role specified '" + docData.username + "/" + docData.role + "' does not exist",
                    "data": ""
                  });
                }
              },
              function(err) { // db error
                cmMethods.dberrors(reject, "querying database", err);
              });
        } else {
          resolve({
            "status": false,
            "message": "Invalid Roles specified '" + docData.roles + "' does not exist",
            "data": ""
          });
        }
      }, function(err) { // db error
        cmMethods.dberrors(reject, "querying database", err);
      });
    });
  },

  getAllDocuments: function(limit) {
    var query = Doc.find({}).populate({
      path: 'ownerId',
      select: 'username'
    }).populate({
      path: 'role',
      select: 'title'
    });
    if (limit) query = query.limit(limit);
    return cmMethods.genericGetAll("Documents", query);
  },

  getDocument: function(id) {
    var query = Doc.findOne({
      _id: id
    });
    return cmMethods.genericGetOne("Documents", query, id);
  },

  updateDocument: function(DocData, id) {
    var query = Doc.findByIdAndUpdate(id, DocData, {
      new: true
    });
    return cmMethods.genericUpdate("Documents", DocData, id, query);
  },
  getDocumentsByOwnerId: function(id) {
    var ownerId = id;
    return new Promise(function(resolve, reject) {
      Doc.getDocumentsByOwnerId(ownerId).then(function(data) {
          if (data.length) {
            resolve({
              "status": true,
              "message": "Document for id " + id,
              "data": data
            });
          }
          resolve({
            "status": false,
            "message": "No Document exist for id " + id,
            "data": ""
          });
        })
        .catch(function(err) {
          cmMethods.dberrors(reject, "querying database", err);
        });
    });
  },

  getDocumentsByDate: function(limit, date) {
    return new Promise(function(resolve, reject) {
      Doc.getDocumentsByDate(limit, date).then(function(data) {
          if (data.length) {
            resolve({
              "status": true,
              "message": "Document for " + date,
              "data": data
            });
          } else {
            resolve({
              "status": false,
              "message": "No Document exist for date ",
              "data": ""
            });
          }
        })
        .catch(function(err) {
          cmMethods.dberrors(reject, "querying database", err);
        });
    });
  },

  getDocumentsByRole: function(limit, date) {
    return new Promise(function(resolve, reject) {
      Doc.getDocumentsByRole(limit, date).then(function(data) {
          if (data.length) {
            resolve({
              "status": true,
              "message": "Document for " + date,
              "data": data
            });
          } else {
            resolve({
              "status": false,
              "message": "No Document exist for date ",
              "data": ""
            });
          }
        })
        .catch(function(err) {
          cmMethods.dberrors(reject, "querying database", err);
        });
    });
  },
  deleteDocument: function(id) {
    var query = Doc.findByIdAndRemove(id);
    return cmMethods.genericDelete("Documents", query, id);
  }
};

module.exports = doc_functions;