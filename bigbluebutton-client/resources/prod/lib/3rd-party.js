var joinVoiceConference2 = function () {
  BBB.listen("userHasJoinedVoiceConference", function(bbbEvent) {
    console.log("Received userHasJoinedVoiceConference event");
  });
  BBB.joinVoiceConference();
}

var getMyRole = function() {
  var myRole = BBB.getMyRole();
  console.log("My role = " + myRole);
}
