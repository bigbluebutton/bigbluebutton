Template.userItem.helpers({
  domain: function() {
    var a = document.createElement('a');
    a.href = this.url;
    return a.hostname;
  },

  // for now just assume user is the first person we find
  getCurrentUser: function(){
  	id = Session.get("userId") || "a1a1a1a1a1a1";
  	var u = Users.findOne({"user.userId":id});
  	return u;
  },

  // using handlebars' {{equals}} wasn't working for these some reason, so a simple JS function to do it
  compareUserIds: function(u1, u2){
  	return u1 === u2;
  },
});

Template.userItem.events({
	'click input.raiseHand': function(event){
		Users.update({_id:this._id}, {$set: {"user.handRaised": true}});
	}, 
	'click input.disableCam': function(event){
		Users.update({_id:this._id},{$set: {"user.sharingVideo": false}});
	}, 
	'click input.disableMic': function(event){
		Users.update({_id:this._id}, {$set: {"user.sharingAudio": false}});
	}, 
	'click input.enableMic': function(event){
		Users.update({_id:this._id},{$set: {"user.sharingAudio": true}});
	}, 
	'click input.enableCam': function(event){
		Users.update({_id:this._id},{$set: {"user.sharingVideo": true}});
	}, 
	'click input.lowerHand': function(event){
		Users.update({_id:this._id}, {$set: {"user.handRaised": false}});
	},
	'click input.setPresenter': function(event){
		/*
		* Not the best way to go about doing this
		* The meeting should probably know about the presenter instead of the individual user
		*/

		// only perform operation is user is not already presenter, prevent extra DB work
		if(!this.user.presenter){ 
			// from new user, find meeting
			var m = Meetings.findOne({meetingName: this.meetingId});

			// unset old user as presenter
			if(m){
				var u = Users.findOne({meetingId:m.meetingName, 'user.presenter':true})
				Users.update({_id:u._id}, {$set: {'user.presenter': false}});
			}
			// set newly selected user as presenter
			Users.update({_id:this._id}, {$set: {"user.presenter": true}});
		}
	}, 
	'click input.kickUser': function(event){
		/*
		* Add:
		*	When user is blown away, if they were presenter remove that from meeting (if kicking the presenter is even possible?)
		*/
		var user = this;
		var meeting = Meetings.findOne({meetingName:this.meetingId});

		if(user !== null && meeting !== null) {
			// find users index. I couldn't get indexOf() working because the array is of objects
			var index = -1;
			for(var i = 0; i < meeting.users.length; i++){
				if(meeting.users[i].userId == user.user.externUserId){
					index = i;
					break;
				}
			}

			if(index >= 0) {
				meeting.users.splice(index, 1);// remove user from meeting
				Meetings.update({_id:meeting._id}, {$set:{users: meeting.users}});// update meeting
				// remove meeting from user
				Users.update({_id:this._id}, {$set: {"meetingId": null}});
			}
		}
	}	
});