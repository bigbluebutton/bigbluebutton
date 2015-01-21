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
xdescribe("usersList template", function () {
  beforeEach(function () {
    emptyUsersCollection();
  });

  it("should have no users when we start with an empty Users collection", function () {
    var div = renderUsersListTemplate();

    expect($(div).find(".userNameEntry")[0]).not.toBeDefined();
  });

  it("should not display presenter icon next to a non-presenter user", function () {
    var document1 = {
      meetingId: "meeting001",
      userId: "user001",
      user: {
        presenter: false
      }
    };
    Meteor.Users.insert(document1);
    var div = renderUsersListTemplate();

    expect($(div).find(".glyphicon-picture")[0]).not.toBeDefined();
  });

  it("should display presenter icon next to the presenter's username", function () {
    var document1 = {
      meetingId: "meeting001",
      userId: "user001",
      user: {
        presenter: true
      }
    };
    Meteor.Users.insert(document1);
    var div = renderUsersListTemplate();

    expect($(div).find(".glyphicon-picture")[0]).toBeDefined();
  });

  it("should display usernames correctly", function () {
    var document1 = {
      meetingId: "meeting001",
      userId: "user001",
      user: {
        name: "Maxim"
      }
    };
    Meteor.Users.insert(document1);
    var div = renderUsersListTemplate();

    expect($(div).find(".userNameEntry").html().trim()).toEqual("Maxim");
  });

  it("should display all the users in chat (correct number)", function () {
    var document1 = {
      meetingId: "meeting001",
      userId: "user001",
      user: {
        name: "Maxim"
      }
    };
    var document2 = {
      meetingId: "meeting001",
      userId: "user002",
      user: {
        name: "Anton"
      }
    };
    var document3 = {
      meetingId: "meeting001",
      userId: "user003",
      user: {
        name: "Danny"
      }
    };

    Meteor.Users.insert(document1);
    Meteor.Users.insert(document2);
    Meteor.Users.insert(document3);
    var div = renderUsersListTemplate();

    expect($(div).find(".userNameEntry").size()).toEqual(3);
  });

  it("should be able to reactively handle new and logged-out users (1 user -> 3 users -> 4 users -> 2 users -> 5 users)", function () {
    var document1 = {
      meetingId: "meeting001",
      userId: "user001",
      user: {
        name: "Maxim"
      }
    };
    var document2 = {
      meetingId: "meeting001",
      userId: "user002",
      user: {
        name: "Anton"
      }
    };
    var document3 = {
      meetingId: "meeting001",
      userId: "user003",
      user: {
        name: "Danny"
      }
    };
    var document4 = {
      meetingId: "meeting001",
      userId: "user004",
      user: {
        name: "Chad"
      }
    };
    var document5 = {
      meetingId: "meeting001",
      userId: "user005",
      user: {
        name: "Fardad"
      }
    };
    var document6 = {
      meetingId: "meeting001",
      userId: "user006",
      user: {
        name: "Adam"
      }
    };
    var document7 = {
      meetingId: "meeting001",
      userId: "user007",
      user: {
        name: "Gary"
      }
    };

    Meteor.Users.insert(document1);
    var div = renderUsersListTemplate();

    expect($(div).find(".userNameEntry").size()).toEqual(1);
    expect($(div).find(".userNameEntry:eq(0)").html().trim()).toEqual("Maxim");

    Meteor.Users.insert(document2);
    Meteor.Users.insert(document3);

    expect($(div).find(".userNameEntry").size()).toEqual(3);
    expect($(div).find(".userNameEntry:eq(0)").html().trim()).toEqual("Maxim");
    expect($(div).find(".userNameEntry:eq(1)").html().trim()).toEqual("Anton");
    expect($(div).find(".userNameEntry:eq(2)").html().trim()).toEqual("Danny");

    Meteor.Users.insert(document4);

    expect($(div).find(".userNameEntry").size()).toEqual(4);
    expect($(div).find(".userNameEntry:eq(0)").html().trim()).toEqual("Maxim");
    expect($(div).find(".userNameEntry:eq(1)").html().trim()).toEqual("Anton");
    expect($(div).find(".userNameEntry:eq(2)").html().trim()).toEqual("Danny");
    expect($(div).find(".userNameEntry:eq(3)").html().trim()).toEqual("Chad");

    removeUserFromCollection("user002");
    removeUserFromCollection("user004");

    expect($(div).find(".userNameEntry").size()).toEqual(2);
    expect($(div).find(".userNameEntry:eq(0)").html().trim()).toEqual("Maxim");
    expect($(div).find(".userNameEntry:eq(1)").html().trim()).toEqual("Danny");

    Meteor.Users.insert(document5);
    Meteor.Users.insert(document6);
    Meteor.Users.insert(document7);

    expect($(div).find(".userNameEntry:eq(0)").html().trim()).toEqual("Maxim");
    expect($(div).find(".userNameEntry:eq(1)").html().trim()).toEqual("Danny");
    expect($(div).find(".userNameEntry:eq(2)").html().trim()).toEqual("Fardad");
    expect($(div).find(".userNameEntry:eq(3)").html().trim()).toEqual("Adam");
    expect($(div).find(".userNameEntry:eq(4)").html().trim()).toEqual("Gary");
  });

  it("should display usernames in the correct order", function () {
    var document1 = {
      meetingId: "meeting001",
      userId: "user001",
      user: {
        name: "Maxim"
      }
    };
    var document2 = {
      meetingId: "meeting001",
      userId: "user002",
      user: {
        name: "Anton"
      }
    };
    var document3 = {
      meetingId: "meeting001",
      userId: "user003",
      user: {
        name: "Danny"
      }
    };

    Meteor.Users.insert(document1);
    Meteor.Users.insert(document2);
    Meteor.Users.insert(document3);
    var div = renderUsersListTemplate();

    expect($(div).find(".userNameEntry:eq(0)").html().trim()).toEqual("Maxim");
    expect($(div).find(".userNameEntry:eq(1)").html().trim()).toEqual("Anton");
    expect($(div).find(".userNameEntry:eq(2)").html().trim()).toEqual("Danny");
  });

  it("should handle listen-only users properly", function () {
    var document1 = {
      meetingId: "meeting001",
      userId: "user001",
      user: {
        name: "Maxim"
      }
    };
    var document2 = {
      meetingId: "meeting001",
      userId: "user002",
      user: {
        name: "Anton",
        listenOnly: true
      }
    };
    var document3 = {
      meetingId: "meeting001",
      userId: "user003",
      user: {
        name: "Danny"
      }
    };

    Meteor.Users.insert(document1);
    Meteor.Users.insert(document2);
    Meteor.Users.insert(document3);
    var div = renderUsersListTemplate();

    expect($(div).find(".glyphicon-headphones")).toBeDefined();
  });
});
