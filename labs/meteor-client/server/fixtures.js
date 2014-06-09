if (Users.find().count() === 0) {
  Users.insert({
    meetingId: "abc",
    user: {
      handRaised: false,
      phoneUser: false,
      presenter: false,
      externUserId: "24d1tjpraogv",
      webcamStream: "",
      userId: "24d1tjpraogv",
      name: "RED",
      permissions: {
        disablePrivChat: false,
        disableCam: false,
        disableMic: false,
        lockedLayout: false,
        disablePubChat: false
      },
      hasStream: false,
      role: "MODERATOR",
      locked: false,
      voiceUser: {
        talking: false,
        webUserId: "24d1tjpraogv",
        joined: false,
        muted: false,
        userId: "24d1tjpraogv",
        callerNum: "RED",
        callerName: "RED",
        locked: false
      },
      listenOnly: false      
    }

  });
}