CreateSeedData = function() {

	////////////////////////////////////////////////////////////////////
	// Create Seed Data
	//

	if(this.Meetings.find().count() === 0) {
	  console.log("recreating meeting");
	  this.Meetings.insert({
	    meetingName: "84f7752554e276083f40b7ff009396ae9b86d05e-1403025827569",
	    users: [
	      {userId: "iy2fkyecenuf"},
	      {userId: "b2b2b2b2b2b2"},
	      {userId: "c3c3c3c3c3c3"}
	    ]
	  });
	}

	if (Meteor.Users.find().count() === 0) {
	  Meteor.Users.insert({
	    meetingId: "84f7752554e276083f40b7ff009396ae9b86d05e-1403025827569",
	    user: {
	      handRaised: false,
	      phoneUser: false,
	      presenter: true,
	      sharingAudio: true,
	      sharingVideo: true,
	      externUserId: "iy2fkyecenuf",
	      webcamStream: "",
	      userId: "iy2fkyecenuf",
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
	        webUserId: "iy2fkyecenuf",
	        joined: false,
	        muted: false,
	        userId: "iy2fkyecenuf",
	        callerNum: "RED",
	        callerName: "RED",
	        locked: false
	      },
	      listenOnly: false      
	    }
	  });

	  Meteor.Users.insert({
	    meetingId: "84f7752554e276083f40b7ff009396ae9b86d05e-1403025827569",

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

	  Meteor.Users.insert({
	    meetingId: "84f7752554e276083f40b7ff009396ae9b86d05e-1403025827569",

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
	        webUserId: "c3c3c3c3c3c3",
	        joined: false,
	        muted: false,
	        userId: "c3c3c3c3c3c3",
	        callerNum: "Joe",
	        callerName: "Joe",
	        locked: false
	      },
	      listenOnly: false      
	  });
	}

	if(this.Chats.find().count() === 0) {
	  this.Chats.insert({
	    chatId: "84f7752554e276083f40b7ff009396ae9b86d05e-1403025827569",
	    messages: [
	      {from: "iy2fkyecenuf", contents: "Hello"},
	      {from: "b2b2b2b2b2b2", contents: "Hey"},
	      {from: "c3c3c3c3c3c3", contents: "Hi"}
	    ]
	  });
	}
}
