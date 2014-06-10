Template.userItem.helpers({
  domain: function() {
    var a = document.createElement('a');
    a.href = this.url;
    return a.hostname;
  },
});
Template.userItem.events({
	'click input.raiseHand': function(event){
		Users.update({_id:this._id}, 
			{
				$set: {"user.handRaised": true}
			}
		);
		console.log (Users);
	}, 
	'click input.lowerHand': function(event){
		Users.update({_id:this._id}, 
			{
				$set: {"user.handRaised": false}
			}
		);
		console.log (Users);
	},
	'click input.kickUser': function(event){
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
				// remove user from meeting
				meeting.users.splice(index, 1);
				// update meeting
				Meetings.update({_id:meeting._id},
					{
						$set: 
						{
							users: meeting.users
						}
					}
				);
				// remove meeting from user
				Users.update({_id:this._id}, 
					{
						$set: {"meetingId": null}
					}
				);
			}
		}
	}
});