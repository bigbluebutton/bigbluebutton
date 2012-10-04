var joinVoiceConference2 = function () {
  BBB.listen("userHasJoinedVoiceConference", function(bbbEvent) {
    console.log("Received userHasJoinedVoiceConference event");
  });
  BBB.joinVoiceConference();
}

var getMyRoleAsynch = function() {
  BBB.listen("GetMyRoleResponse", function(bbbEvent) {
    console.log("Received GetMyRoleResponse event");
  });

  BBB.getMyRole();
}

var getMyRoleSynch = function() {
  BBB.getMyRole(function(myRole) {
    console.log("My role = " + myRole);
  });
}

