###
if Meteor.isServer
  console.log " I am in the server"
  Meteor.startup ->
    console.log "On startup in the server"
    console.log Meteor.config.appName



    #a = new Meteor.ClientProxy()

    #b = new Meteor.RedisPubSub()



    # Module to store the modules registered in the application
    Meteor.config.modules = modules = new Meteor.Modules()
    # Router
    #config.modules.register "MainRouter", new MainRouter()

    # Application modules
    Meteor.config.modules.register "RedisPubSub", new Meteor.RedisPubSub()
    #Meteor.config.modules.register "MessageBus", new Meteor.MessageBus()
    #Meteor.config.modules.register "Controller", new Controller()

    clientProxy = new Meteor.ClientProxy()
    Meteor.config.modules.register "ClientProxy", clientProxy
    ###############clientProxy.listen(app)

###
