var postsData = [
  {
    title: 'Introducing Telescope',
    author: 'Sacha Greif',
    url: 'http://sachagreif.com/introducing-telescope/'
  },
  {
    title: 'Meteor',
    author: 'Tom Coleman',
    url: 'http://meteor.com'
  },
  {
    title: 'The Meteor Book',
    author: 'Tom Coleman',
    url: 'http://themeteorbook.com'
  }
];

Template.usersList.helpers({
  users: function() {
    console.log (Users);
    //console.log
    return Users.find();
  },

  getMeetings: function(){
    return Meetings.find();
  },

  /* should be changed to find all users listed in the meeting and retrieve them,
  instead of here where we retrieve every user pointing to the meeting */
  getUsersInMeeting: function(meetingName){
    return Users.find({meetingId: meetingName});
  }

});

Template.usersList.events({
  'click input.signin': function(event){
    Session.set("userId", event.target.id);
  }
});
