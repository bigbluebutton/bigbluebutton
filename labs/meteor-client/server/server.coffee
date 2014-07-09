###
Meteor.startup(function () {
  console.log('server start');
  // cleanup collections
  remove_all_data = false;
  
  if(remove_all_data){
    Meteor.Users.remove({});
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
###

Meteor.startup ->
  console.log "server start"

  #remove all data
  Meteor.Users.remove({})
  console.log "cleared Users Collection!"
  Meteor.Chat.remove({})
  console.log "cleared Chat Collection!"
  Meteor.ChatTabs.remove({})
  console.log "cleared ChatTabs Collection!"

  # create create a PubSub connection, start listening
  Meteor.redisPubSub = new Meteor.RedisPubSub(->
    console.log "created pubsub")
