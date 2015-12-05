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
    "status": 500,
    "message": "Error " + dbaction,
    "error": err
  });
};
exports.dberrors = dberrors;

var not_exist = function(modelName, data, resolve) {
  resolve({
    "status": 401,
    "message": modelName + "(s) do(es) not exist",
    "data": data
  });
};
exports.not_exist = not_exist;


/// Generic create method

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
            console.log("Created", modelName);
            resolve({
              "status": 200,
              "message": "Created new " + modelName,
              "data": rstcreate
            });
          }, function(err) { //db error
            console.log("Error creating", modelName);
            dberrors(reject, "creating " + modelName, err);
          });
        } else { // document exists
          console.log(modelName, "(s) already exist ");
          resolve({
            "status": 500,
            "message": modelName + " already exist \n Change unique data",
            "data": rstfind
          });
        }
      }, function(err) { // db error
        console.log("Error querying database");
        dberrors(reject, "querying database", err);
      });
    }).catch(function(err) {
      console.log("Error querying database");
      dberrors(reject, "querying database", err);
    });
  });
}

///  Generic getAll
exports.genericGetAll = function(modelName, query) {
  return new Promise(function(resolve, reject) {
    query.then(function(rstGet) {
        if (rstGet.length) {
          resolve({
            "status": 200,
            "message": "Existing " + modelName,
            "data": rstGet
          });
        } else {
          not_exist(modelName, rstGet, resolve);
        }
      },
      function(err) { // db error
        console.log("Error querying database");
        dberrors(reject, "querying database", err);
      });
  });
}

// Generic getOne
exports.genericGetOne = function(modelName, query, id) {
  return new Promise(function(resolve, reject) {
    if (id === undefined) {
      resolve({
        "status": 500,
        "message": "Get parameter not specified",
        "data": ""
      });
    }
    query.then(function(rstGetOne) {
      if (rstGetOne) {
        resolve({
          "status": 200,
          "message": modelName + " data:",
          "data": rstGetOne
        });
      } else {
        not_exist(modelName, id, resolve);
      }
    }, function(err) {
      console.log("Error querying database");
      dberrors(reject, "querying database", err);
    });
  });
}

// Generic Update document
exports.genericUpdate = function(modelName, modelData, id, query) {
  return new Promise(function(resolve, reject) {
    if (id === undefined) {
      resolve({
        "status": 500,
        "message": "Get parameter not specified",
        "data": ""
      });
    }
    query.then(function(rstUpdate) {
      if (rstUpdate) {
        resolve({
          "status": 200,
          "message": "Updated " + modelName,
          "data": rstUpdate
        });
      } else {
        not_exist(modelName, id, resolve);
      }
    }, function(err) {
      console.log("Error querying database");
      dberrors(reject, "querying database", err);
    });
  });
}

// Generic delete document
exports.genericDelete = function(modelName, query, id) {
  return new Promise(function(resolve, reject) {
    if (id === undefined) {
      resolve({
        "status": 500,
        "message": "Get parameter not specified",
        "data": ""
      });
    }
    query.then(function(rstDel) {
        if (rstDel) {
          resolve({
            "status": 200,
            "message": "Removed " + modelName,
            "data": rstDel
          });
        } else {
          not_exist(modelName, id, resolve);
        }
      },
      function(err) { // db error
        console.log("Error querying database");
        dberrors(reject, "querying database", err);
      });
  });
}