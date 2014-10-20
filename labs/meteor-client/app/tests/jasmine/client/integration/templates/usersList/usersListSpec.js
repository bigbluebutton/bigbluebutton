var emptyUsersCollection = function() {
  Meteor.Users.find().map(function(item) {
    Meteor.Users.remove({ _id: item._id });
  });
}

var renderUsersListTemplate = function() {
  var div = document.createElement("div");
    var data = {};
    data.id = "users";
    data.name = "usersList";
    var comp = Blaze.renderWithData(Template.usersList, data); // loading data is optional
    Blaze.insert(comp, div);
    return div;
}

// TODO: try to use Meteor methods instead
var removeUserFromCollection = function(id) {
  Meteor.Users.find().map(function(item) {
    if(item.userId == id) Meteor.Users.remove({ _id: item._id });
  });
}

// TODO: try to start with calling the app's methods instead of modifying the collection
describe("usersList template", function () {
  beforeEach(function () {
    emptyUsersCollection();
  });

  it("should have no users when we start with an empty Users collection", function () {
    var div = renderUsersListTemplate();

    expect($(div).find(".userNameEntry")[0]).not.toBeDefined();
  });

  it("should not display presenter icon next to a non-presenter user", function () {
    Meteor.Users.insert({ meetingId: "meeting001", userId: "user001", user: { presenter: false } });
    var div = renderUsersListTemplate();

    expect($(div).find(".glyphicon-picture")[0]).not.toBeDefined();
  });

  it("should display presenter icon next to the presenter's username", function () {
    Meteor.Users.insert({ meetingId: "meeting001", userId: "user001", user: { presenter: true } });
    var div = renderUsersListTemplate();

    expect($(div).find(".glyphicon-picture")[0]).toBeDefined();
  });

  // still work in progress
  it("should display user's name correctly", function () {
    Meteor.Users.insert({ meetingId: "meeting001", userId: "user001", user: { name: "Maxim" } });
    var div = renderUsersListTemplate();

    // TODO: check the actual username instead
    expect($(div).find(".userNameEntry")[0]).toBeDefined();
  });

  it("should display all the users in chat (correct number)", function () {
    Meteor.Users.insert({ meetingId: "meeting001", userId: "user001", user: { name: "Maxim" } });
    Meteor.Users.insert({ meetingId: "meeting001", userId: "user002", user: { name: "Anton" } });
    Meteor.Users.insert({ meetingId: "meeting001", userId: "user003", user: { name: "Danny" } });
    var div = renderUsersListTemplate();

    expect($(div).find(".userNameEntry").size()).toEqual(3);
  });

  it("should be able to reactively handle new users (1 user -> 3 users -> 4 users)", function () {
    Meteor.Users.insert({ meetingId: "meeting001", userId: "user001", user: { name: "Maxim" } });
    var div = renderUsersListTemplate();

    expect($(div).find(".userNameEntry").size()).toEqual(1);
    Meteor.Users.insert({ meetingId: "meeting001", userId: "user002", user: { name: "Anton" } });
    Meteor.Users.insert({ meetingId: "meeting001", userId: "user003", user: { name: "Danny" } });
    expect($(div).find(".userNameEntry").size()).toEqual(3);
    Meteor.Users.insert({ meetingId: "meeting001", userId: "user004", user: { name: "Chad" } });
    expect($(div).find(".userNameEntry").size()).toEqual(4);
  });

  // // TODO: check if we hide actual usernames correctly
  it("should be able to reactively handle logged-out users (4 users -> 3 users -> 1 user)", function () {
    Meteor.Users.insert({ meetingId: "meeting001", userId: "user001", user: { name: "Maxim" } });
    Meteor.Users.insert({ meetingId: "meeting001", userId: "user002", user: { name: "Anton" } });
    Meteor.Users.insert({ meetingId: "meeting001", userId: "user003", user: { name: "Danny" } });
    Meteor.Users.insert({ meetingId: "meeting001", userId: "user004", user: { name: "Chad" } });
    var div = renderUsersListTemplate();

    expect($(div).find(".userNameEntry").size()).toEqual(4);

    removeUserFromCollection("user002");

    expect($(div).find(".userNameEntry").size()).toEqual(3);

    removeUserFromCollection("user004");
    removeUserFromCollection("user001");

    expect($(div).find(".userNameEntry").size()).toEqual(1);
  });
});
