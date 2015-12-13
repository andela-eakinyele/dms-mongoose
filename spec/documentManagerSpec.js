var mockDms = require("./mockMethods");
var ModelFunc = require("./../documentManager");
var _ = require("lodash");

mockDms.connect();

describe('CRUD operations in database', function() {
  var roles, users, docs, userTest, roleTest, allUsers;

  beforeEach(function(done) {
    mockDms.dropDB(function() {
      mockDms.populateMock(function(result) {
        if (result) {
          users = _.filter(result[1], function(reslt) {
            return typeof reslt !== 'string';
          });
          docs = _.filter(result[2], function(reslt) {
            return typeof reslt !== 'string';
          });
          var userAttr = ["name", "username", "role", "email"];
          var docAttr = ["username", "documentName", "title", "content", "dateCreated"];
          userTest = _.zipObject(userAttr, _.map(userAttr, function(attr) {
            return _.pluck(users, attr);
          }));
          docTest = _.zipObject(docAttr, _.map(docAttr, function(attr) {
            return _.pluck(docs, attr);
          }));
          done();
        } else {
          done();
        }
      });
    });
  });

  // tests for User
  describe('Users', function(done) {
    beforeEach(function(done) {
      ModelFunc.users.getAllUsers().then(function(users) {
        allUsers = users.data;
        var mapRole = _.pluck(allUsers, "role");
        roleTest = _.map(mapRole, function(role) {
          return _.map(role, function(_role) {
            return _role.title;
          }).join(", ");
        });
        done();
      });
    });
    it('User created is unique - username, email', function(done) {
      expect(userTest.username).toBeDefined;
      expect(userTest.username).toEqual(["EAbbott", "DAdams", "HAhmed"]);
      expect(userTest.username).toEqual(_.uniq(userTest.username));
      expect(userTest.email).toEqual(_.uniq(userTest.email));
      done();
    });

    it('User has a role defined', function(done) {
      expect(roleTest).toBeDefined;
      expect(roleTest).toEqual(["Admin", "Scientist", "Writer"]);
      expect(roleTest.length).toEqual(3);
      done();
    });

    it('User has first and last names', function(done) {
      expect(userTest.name).toBeDefined;
      expect(userTest.name.length).toEqual(3);
      expect(mockDms.isStringLen(userTest.name)).toBeTruthy();
      done();
    });

    it('Returns all users created', function(done) {
      expect(allUsers.length).toEqual(3);
      var allUsernames = _.pluck(allUsers, "username");
      expect(["EAbbott", "DAdams", "HAhmed"]).toEqual(allUsernames);
      done();
    });
  });

  // tests  for roles
  describe('"Role"', function(done) {
    var allRoles;

    beforeEach(function(done) {
      ModelFunc.roles.getAllRoles().then(function(roles) {
        allRoles = _.pluck(roles.data, "title");
        done();
      });
    });

    it('validates role added has a unique title', function(done) {
      expect(allRoles).toBeDefined;
      expect(allRoles.length).toEqual(3);
      expect(allRoles).toEqual(_.uniq(allRoles));
      done();
    });

    it('Returns all roles created', function(done) {
      expect(allRoles).toEqual(["Admin", "Scientist", "Writer"]);
      done();
    });
  });

  // tests for Document
  describe('"Document"', function(done) {
    it('validates document created has a publish date', function(done) {
      expect(docTest.dateCreated).toBeDefined;
      expect(docTest.dateCreated.length).toEqual(5);
      expect(mockDms.isDate(docTest.dateCreated)).toBeTruthy();
      done();
    });

    it('Returns all document created', function(done) {
      ModelFunc.docs.getAllDocuments().then(function(docs) {
        var allDocumentname = _.pluck(docs.data, "documentName");
        expect(docs.data.length).toEqual(5);
        expect(allDocumentname).toEqual(["Lorems.js", "Staples.json", "Techie.txt", "Clothes.doc", "Hardware.jsx"]);
        done();
      });
    });
  });

  describe('Search', function(done) {
    it('Returns a specified number of ordered list by date by given role', function(done) {
      ModelFunc.docs.getDocumentsByRole(2, "Scientist").then(function(docs) {
        var roles = _.pluck(docs.data, "role");
        var dates = _.pluck(docs.data, "dateCreated");
        var docsHaveRole = _.filter(roles, function (role) {
          return _.pluck(role, "title").indexOf("Scientist") > 0;
        });
        expect(docs.data.length).toEqual(2);
        expect(docsHaveRole.length).toEqual(2);
        expect(dates[0] < dates[1]).toBeTruthy();
        done();
      });
    });

    it('Returns a specified number of document published on given date', function(done) {
      ModelFunc.docs.getDocumentsByDate(3, "Wed Dec 09 2015").then(function(docs) {
        console.log(docs);
        var allDocumentDates = _.pluck(docs.data, "dateCreated");
        expect(allDocumentDates.length).toEqual(3);
        expect(allDocumentDates[0] < allDocumentDates[1]).toBeTruthy();
        done();
      });
    });
  });

});