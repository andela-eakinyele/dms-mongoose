var _ = require("lodash");

// generate objec data for create and update
exports.parseData = function(keys, _data) {
  return _.zipObject(keys, _data);
};

var getNextId = function(qresult) {
  var maxId = _.max(qresult.map(function(value) {
    return value["_id"];
  }));
  return parseInt(maxId) + 1;
};
exports.getNextId = getNextId;

var dberrors = function(reject, dbaction, err) {
  reject({
    "status": false,
    "message": "Error " + dbaction,
    "error": err
  });
};
exports.dberrors = dberrors;

var not_exist = function(modelName, data, resolve) {
  resolve({
    "status": false,
    "message": modelName + "(s) do(es) not exist",
    "data": data
  });
};
exports.not_exist = not_exist;

//Generic create method
/**
 * @modelName  {String} - Model name in database collection 
 * @modelData  {Object} - Key-pair value of document to be created
 * @model  {Object} - model object defined in schema
 * @findQuery  {Object} - Model#query object for verifying existing unique document
 * @return {Promise} - Promise object with create result
 */
exports.genericCreate = function(modelName, modelData, model, findQuery) {
  var query = findQuery;
  return new Promise(function(resolve, reject) {
    // fetch maximum id from collection and increment by 1
    model.getMaxId().then(function(data) {
      if (data.length) modelData._id = getNextId(data);
      // exceute existing document query 
      query.then(function(rstfind) {
        if (!rstfind.length) { // if no document exists
          //create document
          model.create(modelData).then(function(rstcreate) {
            resolve({
              "status": true,
              "message": "Created new " + modelName,
              "data": rstcreate
            });
          }, function(err) { //db error
            dberrors(reject, "creating " + modelName, err);
          });
        } else { // document exists
          console.log(modelName, "(s) already exist ");
          resolve({
            "status": false,
            "message": modelName + " already exist \n Change unique data",
            "data": JSON.stringify(rstfind)
          });
        }
      }, function(err) { // db error
        dberrors(reject, "querying database", err);
      });
    }).catch(function(err) {
      dberrors(reject, "querying database", err);
    });
  });
}

///  Generic getAll
/**
 * @modelName  {String} - Model name in database collection 
 * @query  {Object} - Model#query object to execute
 * @return {Promise} - Promise object with getAll result
 */
exports.genericGetAll = function(modelName, query) {
  return new Promise(function(resolve, reject) {
    query.then(function(rstGet) {
        if (rstGet.length) {
          resolve({
            "status": true,
            "message": "Existing " + modelName,
            "data": rstGet
          });
        } else {
          not_exist(modelName, rstGet, resolve);
        }
      },
      function(err) { // db error
        dberrors(reject, "querying database", err);
      });
  });
}

// Generic getOne
/**
 * @modelName  {String} - Model name in database collection 
 * @query  {Object} - Model#query object to execute
 * @id {Number} - Id of document to fetch 
 * @return {Promise} - Promise object with getAll result
 */
exports.genericGetOne = function(modelName, query, id) {
  return new Promise(function(resolve, reject) {
    if (id === undefined) {
      resolve({
        "status": false,
        "message": "Get parameter not specified",
        "data": ""
      });
    }
    query.then(function(rstGetOne) {
      if (rstGetOne) {
        resolve({
          "status": true,
          "message": modelName + " data:",
          "data": rstGetOne
        });
      } else {
        not_exist(modelName, id, resolve);
      }
    }, function(err) {
      dberrors(reject, "querying database", err);
    });
  });
}

// Generic Update document
/**
 * @modelName  {String} - Model name in database collection 
  * @modelData  {Object} - Key-pair value of document to be updated
 * @query  {Object} - Model#query object to execute
 * @id {Number} - Id of document to update 
 * @return {Promise} - Promise object with update result
 */
exports.genericUpdate = function(modelName, modelData, id, query) {
  return new Promise(function(resolve, reject) {
    if (id === undefined) {
      resolve({
        "status": false,
        "message": "Get parameter not specified",
        "data": ""
      });
    }
    query.then(function(rstUpdate) {
      if (rstUpdate) {
        resolve({
          "status": true,
          "message": "Updated " + modelName,
          "data": rstUpdate
        });
      } else {
        not_exist(modelName, id, resolve);
      }
    }, function(err) {
      dberrors(reject, "querying database", err);
    });
  });
}

// Generic delete document
/**
 * @modelName  {String} - Model name in database collection 
 * @query  {Object} - Model#query object to execute
 * @id {Number} - Id of document to delete 
 * @return {Promise} - Promise object with delete result
 */
exports.genericDelete = function(modelName, query, id) {
  return new Promise(function(resolve, reject) {
    if (id === undefined) {
      resolve({
        "status": false,
        "message": "Get parameter not specified",
        "data": ""
      });
    }
    query.then(function(rstDel) {
        if (rstDel) {
          resolve({
            "status": true,
            "message": "Removed " + modelName,
            "data": rstDel
          });
        } else {
          not_exist(modelName, id, resolve);
        }
      },
      function(err) { // db error
        dberrors(reject, "querying database", err);
      });
  });
}