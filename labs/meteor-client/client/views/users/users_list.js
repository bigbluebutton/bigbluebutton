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
    console.log("meetings--------------");
    console.log(Meetings);
    return Meetings.find();
  },

  getUsersInMeeting: function(meetingName){
    return Users.find({meetingId: meetingName});
  }

});
