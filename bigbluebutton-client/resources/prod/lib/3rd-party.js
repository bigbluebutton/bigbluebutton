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

var muteMe = function() {
  BBB.muteMe();
}

var unmuteMe = function() {
  BBB.unmuteMe();
}

var muteAll = function() {
  BBB.muteAll();
}

var unmuteAll = function() {
  BBB.unmuteAll();
} 

var switchLayout = function(newLayout) {
  BBB.switchLayout(newLayout);
}

var echoPublicChat = function () {
  BBB.listen("NewPublicChatEvent", function(bbbEvent) {
    console.log("Received NewPublicChatEvent event");
    var message = "ECHO: " + bbbEvent.message;
    BBB.sendPublicChatMessage(bbbEvent.fromUserID, bbbEvent.fromColor, bbbEvent.fromLang, message);
  });
}

var echoPrivateChat = function () {
  BBB.listen("NewPrivateChatEvent", function(bbbEvent) {
    console.log("Received NewPrivateChatEvent event");
    var message = "ECHO: " + bbbEvent.message;
    BBB.sendPrivateChatMessage(bbbEvent.toUserID, bbbEvent.fromColor, bbbEvent.fromLang, message,  bbbEvent.fromUserID);
  });
}
