#!/usr/bin/env node

var program = require('commander');
var _ = require("lodash");
var fs = require("fs");
var mongoose = require('mongoose');

// require model methods
var userFunc = require("./../src/userMethods");
var roleFunc = require("./../src/roleMethods");
var docFunc = require("./../src/docMethods");

// Connect database
mongoose.connect('mongodb://localhost/test', function(err, conn) {
  if (err) {
    console.log("Unable to connect", err);
    return;
  }
  console.log('Connected to database');
});

// Define args for model methods
var userData = ["fname", "lname", "username", "password", "role", "email"];
var docData = ["username", "documentName", "title", "content"];
var roleData = ["title"];

// populate arrays of model methods and args
var arrModelFunc = [userFunc, docFunc, roleFunc];
var data = [userData, docData, roleData];

// define command line
program
  .version('0.0.1')
  .usage('<cmd> [options] [parameters...]')
  .option("-f, --filemode <file>", "filepath for data")
  .parse(process.argv);

// retrieve args
var args = program.args;

// output help on no args
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

// reads data for ffile modes
var readdata = function(file) {
  var _read = fs.readFileSync(file, 'utf8');
  return _read.split("\n");
};

// verify argument
function argCheck(enteredArg, requiredArg) {
  if (enteredArg.length < enteredArg.length) {
    console.log("fill missing arguments: \n" + _.takeRight(requiredArg, requiredArg.length - enteredArg.length).join(" "));
  } else if (enteredArg.length > requiredArg.length) {
    console.log("Too many arguments supplied");
    console.log(requiredArg);
  }
}
// retrieve method based on args[0]
var useFunc = getModelFunc(args[0]);
// verify args is valid
if (typeof useFunc[0] !== "function") {
  console.log(useFunc);
  program.outputHelp();
  process.exit(1);
}

// Define command action for create argument
if (/^create/.test(args[0])) {
  // check for file mode option
  if (!program.filemode) {
    var createData = args.slice(1); // get argument
    if (createData.length === useFunc[1].length) { // check for argument length
      useFunc[0](createData).then(function(result) {
        console.log(result);
        process.exit(0);
      }).catch(function(err) {
        console.log(err);
        process.exit(1);
      });
      // arguments supplied is too few or too many 
    } else {
      argCheck(createData, useFunc[1]);
      process.exit(1);
    }

    // filemode for create argument
  } else {
    var fileData = readdata(program.filemode); // read file data
    // loop through data
    _.forEach(fileData, function(fdata, index) {
      var createData = fdata.replace(/\r\n/).trim().split(/[\s]+/);
      if (createData.length === useFunc[1].length) {
        useFunc[0](createData).then(function(result) {
          console.log(JSON.stringify(result));
          if (index === fileData.length - 1) {
            process.exit(0)
          };
        }).catch(function(err) {
          console.log(err);
        });
      } else {       // arguments supplied is too few or too many 
        console.log(index + 1);
        argCheck(usable, useFunc[1]);
        if (index === fileData.length - 1) {
          process.exit(0)
        };
      }
    });
  }  
} 

// Define command action for get commands
if (/^get/.test(args[0])) {
  // check for getBy methods
  if (!(/(By)/.test(args[0]))) {
    useFunc[0](args[1]).then(function(result) {
      console.log(result.message);
      // check for empty or null data
      if (result.data.length === 0 || result.data === null) {
        console.log("No data\n");
        process.exit(0);
      }
      // check for array of data
      if (!result.data.length) {
        console.log(result.data);
        process.exit(0);
      }
      // loop through array of data
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