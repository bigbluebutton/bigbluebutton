CreateSeedData = function() {

	////////////////////////////////////////////////////////////////////
	// Create Seed Data
	//

	if(Meetings.find().count() === 0) {
	  console.log("recreating meeting");
	  Meetings.insert({
	    meetingName: "Classroom1",
	    users: [
	      {userId: "24d1tjpraogv"},
	      {userId: "24d16kfdmbd4"},
	      {userId: "1111k54k67s4"}
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
	      externUserId: "24d1tjpraogv",
	      webcamStream: "",
	      userId: "24d1tjpraogv",
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
	  Users.insert({
	    meetingId: "Classroom1",
	    user: {
	      handRaised: false,
	      phoneUser: false,
	      presenter: false,
	      sharingAudio: true,
	      sharingVideo: false,
	      externUserId: "24d16kfdmbd4",
	      webcamStream: "",
	      userId: "24d16kfdmbd4",
	      name: "BLUE",
	      permissions: {
	        disablePrivChat: false,
	        disableCam: false,
	        disableMic: false,
	        lockedLayout: false,
	        disablePubChat: false
	      },
	      hasStream: false,
	      role: "USER",
	      locked: false,
	      voiceUser: {
	        talking: false,
	        webUserId: "24d16kfdmbd4",
	        joined: false,
	        muted: false,
	        userId: "24d16kfdmbd4",
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
	      externUserId: "1111k54k67s4",
	      webcamStream: "",
	      userId: "1111k54k67s4",
	      name: "Joe",
	      permissions: {
	        disablePrivChat: false,
	        disableCam: false,
	        disableMic: false,
	        lockedLayout: false,
	        disablePubChat: false
	      },
	      hasStream: false,
	      role: "USER",
	      locked: false,
	      voiceUser: {
	        talking: false,
	        webUserId: "1111k54k67s4",
	        joined: false,
	        muted: false,
	        userId: "1111k54k67s4",
	        callerNum: "Joe",
	        callerName: "Joe",
	        locked: false
	      },
	      listenOnly: false      
	    }
	  });
	}
}