var Doc = require("./../servers/models/document");
var User = require("./../servers/models/user");

var cmMethods = require("./helpers");
var docKeys = ["username", "documentName", "title", "content"];


var doc_functions = {
  createDocument: function(_docData) {
    var docData = cmMethods.parseData(docKeys, _docData);
    // query for existing document
    var condition = [{
      documentName: docData.documentName
    }];
    // get OwnerId
    return new Promise(function(resolve, reject) {
      User.findOne({
        username: docData.username,
      }, "_id").then(function(userid) {
          if (userid) {
            condition.push({
              "ownerId": userid
            });
            docData.ownerId = userid;
            var query = Doc.find({}).and(condition);
            resolve(cmMethods.genericCreate("Documents", docData, Doc, query));
          } else {
            console.log("User does not exist");
            cmMethods.dberrors(reject, "Invalid User specified", docData.username + " does not exist");
          }
        },
        function(err) { // db error
          console.log("querying database", err);
          cmMethods.dberrors(reject, "querying database", err);
        });
    });
  },

  getAllDocuments: function(limit) {
    var query = Doc.find({});
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
              "status": 200,
              "message": "Document for id " + id,
              "data": data
            });
          }
          resolve({
            "status": 401,
            "message": "No Document exist for id " + id,
            "data": data
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
              "status": 200,
              "message": "Document for " + date,
              "data": data
            });
          } else {
            resolve({
              "status": 401,
              "message": "No Document exist for date ",
              "data": data
            });
          }
        })
        .catch(function(err) {
          console.log(err);
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