////////////////////////////////////////////////////////////////////
// Startup
//

Meteor.startup(function () {
  console.log('server start');
  // cleanup collections
  remove_all_data = false;
  
  if(remove_all_data){
    Meteor.users.remove({});
    this.Meetings.remove({});
    this.Chats.remove({});
  }

  // Add seed data if first time server starting
  CreateSeedData();

  // Publish data collections
  PublishCollections();

  // Set collection permissions
  SetCollectionPermissions();

});
