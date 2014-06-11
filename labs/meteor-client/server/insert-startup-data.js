CreateSeedData = function() {

	////////////////////////////////////////////////////////////////////
	// Create Seed Data
	//

	if(Meetings.find().count() === 0) {
	  console.log("recreating meeting");
	  Meetings.insert({
	    meetingName: "Classroom1",
	    users: [
	      {userId: "a1a1a1a1a1a1"},
	      {userId: "b2b2b2b2b2b2"},
	      {userId: "c3c3c3c3c3c3"}
	    ]
	  });
	}

	if (Users.find().count() === 0) {
	  Users.insert({
	    meetingId: "Classroom1",
	    user: {
	      handRaised: false,
	      phoneUser: false,
	      presenter: true,
	      sharingAudio: true,
	      sharingVideo: true,
	      externUserId: "a1a1a1a1a1a1",
	      webcamStream: "",
	      userId: "a1a1a1a1a1a1",
	      name: "RED",
	      permissions: {
	        disablePrivChat: false,
	        disableCam: true,
	        disableMic: true,
	        lockedLayout: false,
	        disablePubChat: false
	      },
	      hasStream: false,
	      role: "MODERATOR",
	      locked: false,
	      voiceUser: {
	        talking: false,
	        webUserId: "a1a1a1a1a1a1",
	        joined: false,
	        muted: false,
	        userId: "a1a1a1a1a1a1",
	        callerNum: "RED",
	        callerName: "RED",
	        locked: false
	      },
	      listenOnly: false      
	    }
	  });
	  Users.insert({
	    meetingId: "Classroom1",
	    user: {
	      handRaised: false,
	      phoneUser: false,
	      presenter: false,
	      sharingAudio: true,
	      sharingVideo: false,
	      externUserId: "b2b2b2b2b2b2",
	      webcamStream: "",
	      userId: "b2b2b2b2b2b2",
	      name: "BLUE",
	      permissions: {
	        disablePrivChat: false,
	        disableCam: true,
	        disableMic: true,
	        lockedLayout: false,
	        disablePubChat: false
	      },
	      hasStream: false,
	      role: "USER",
	      locked: false,
	      voiceUser: {
	        talking: false,
	        webUserId: "b2b2b2b2b2b2",
	        joined: false,
	        muted: false,
	        userId: "b2b2b2b2b2b2",
	        callerNum: "BLUE",
	        callerName: "BLUE",
	        locked: false
	      },
	      listenOnly: false      
	    }
	  });
	  Users.insert({
	    meetingId: "Classroom1",
	    user: {
	      handRaised: false,
	      phoneUser: false,
	      presenter: false,
	      sharingAudio: true,
	      sharingVideo: false,
	      externUserId: "c3c3c3c3c3c3",
	      webcamStream: "",
	      userId: "c3c3c3c3c3c3",
	      name: "Joe",
	      permissions: {
	        disablePrivChat: false,
	        disableCam: true,
	        disableMic: true,
	        lockedLayout: false,
	        disablePubChat: false
	      },
	      hasStream: false,
	      role: "USER",
	      locked: false,
	      voiceUser: {
	        talking: false,
	        webUserId: "c3c3c3c3c3c3",
	        joined: false,
	        muted: false,
	        userId: "c3c3c3c3c3c3",
	        callerNum: "Joe",
	        callerName: "Joe",
	        locked: false
	      },
	      listenOnly: false      
	    }
	  });
	}
}