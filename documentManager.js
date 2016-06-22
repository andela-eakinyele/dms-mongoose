var userFunc = require("./src/userMethods");
var roleFunc = require("./src/roleMethods");
var docFunc = require("./src/docMethods");

module.exports = {
  users: userFunc,
  docs: docFunc,
  roles: roleFunc
};