#!/usr/bin/env node

var program = require('commander');
var _ = require("lodash");
var fs = require("fs");
var mongoose = require('mongoose');


// require model methods
var userFunc = require("./../src/userMethods");
var roleFunc = require("./../src/roleMethods");
var docFunc = require("./../src/docMethods");

mongoose.connect('mongodb://localhost/test', function(err, conn) {
  if (err) {
    console.log("Unable to connect", err);
    return;
  }
  console.log('Connected to database');
});

var userData = ["fname", "lname", "username", "password", "role", "email"];
var docData = ["username", "documentName", "title", "content"];
var roleData = ["title"];

var arrModelFunc = [userFunc, docFunc, roleFunc];
var data = [userData, docData, roleData];

program
  .version('0.0.1')
  .usage('<cmd> [options] [parameters...]')
  .option("-f, --filemode <file>", "filepath for data")
  .parse(process.argv);

var args = program.args;
if (!args.length) {
  program.outputHelp();
  process.exit(1);
}
// get equivalent command function
function getModelFunc(cmdArg) {
  modelFunc = _.filter(arrModelFunc, function(modelMthd, index) {
    return modelMthd[cmdArg] !== undefined;
  });
  if (modelFunc[0]) {
    var index = arrModelFunc.indexOf(modelFunc[0]);
    return [modelFunc[0][cmdArg], data[index]];
  }
  return "Invalid Command";
}
// read data for ffile modes
var readdata = function(file) {
  var _read = fs.readFileSync(file, 'utf8');
  return _read.split("\n");
};

var useFunc = getModelFunc(args[0]);
if (typeof useFunc[0] !== "function") {
  console.log(useFunc);
  program.outputHelp();
  process.exit(1);
}

// create user mode
if (/^create/.test(args[0])) {
  if (!program.filemode) {
    var createData = args.slice(1, useFunc[1].length + 1);
    if (createData.length === useFunc[1].length) {
      useFunc[0](createData).then(function(result) {
        console.log(result);
        process.exit(0);
      }).catch(function(err) {
        console.log(err);
        process.exit(1);
      });
    } else {
      console.log("fill missing arguments: " + _.takeRight(useFunc[1], useFunc[1].length - createData.length).join(" "));
      process.exit(1);
    }
  } else {
    var fileData = readdata(program.filemode);
    _.forEach(fileData, function(fdata, index) {
      var usable = fdata.replace(/\r\n/).trim().split(/[\s]+/);
      if (usable.length === useFunc[1].length) {
        var createData = _.zipObject(useFunc[1], usable);
        useFunc[0](createData).then(function(result) {
          console.log(JSON.stringify(result));
          if (index === fileData.length - 1) {
            process.exit(0)
          };
        }).catch(function(err) {
          console.log(err);
        });
      } else {
        var miss = _.takeRight(useFunc[1], useFunc[1].length - usable.length).join(" ");
        console.log("fill missing arguments in line: " + (index + 1) + " " + miss);
        if (index === fileData.length - 1) {
          process.exit(0)
        };
      }
    });
  }
} else if (/^get/.test(args[0])) {
  if (!(/(By)/.test(args[0]))) {
    useFunc[0](args[1]).then(function(result) {
      console.log(result.message);
      if (result.data.length === 0 || result.data === null) {
        console.log("No data\n");
        console.log(result);
        process.exit(0);
      }
      if (!result.data.length) {
        console.log(result.data);
        process.exit(0);
      }
      _.forEach(result.data, function(_result, index) {
        console.log(JSON.stringify(_result));
        if (index === result.data.length - 1) {
          process.exit(0);
        }
      });
    }).catch(function(err) {
      console.log(err);
      if (index === result.length - 1) {
        process.exit(1);
      }
    });
  }
  // define command including the BY keyword
  else {
    if (isNaN(args[1])) {
      args[2] = args[1];
      args[1] = undefined;
    }
    else{

    }
    console.log(args);
    useFunc[0](args[1], args[2]).then(function(result) {
      if (result.length === 0) {
        console.log("No data");
        process.exit(0);
      }
      _.forEach(result, function(_result, index) {
        console.log(JSON.stringify(_result));
        console.log("\n");
        if (index === result.length - 1) {
          process.exit(0);
        }
      });
    }).catch(function(err) {
      console.log(err);
      if (index === result.length - 1) {
        process.exit(1);
      }
    });
  }
}