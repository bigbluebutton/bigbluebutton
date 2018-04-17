package org.bigbluebutton.vertx;

import io.vertx.core.AbstractVerticle;
import io.vertx.core.eventbus.EventBus;
import io.vertx.core.json.JsonObject;
import io.vertx.ext.bridge.BridgeEventType;
import io.vertx.ext.web.Router;
import io.vertx.ext.web.handler.BodyHandler;
import io.vertx.ext.web.handler.CookieHandler;
import io.vertx.ext.web.handler.SessionHandler;
import io.vertx.ext.web.handler.StaticHandler;
import io.vertx.ext.web.handler.sockjs.BridgeOptions;
import io.vertx.ext.web.handler.sockjs.PermittedOptions;
import io.vertx.ext.web.handler.sockjs.SockJSHandler;
import io.vertx.ext.web.handler.sockjs.SockJSHandlerOptions;
import io.vertx.ext.web.sstore.LocalSessionStore;
import org.bigbluebutton.ConnectionManager;
import org.bigbluebutton.VertxToAkkaGateway;

import java.text.DateFormat;
import java.time.Instant;
import java.util.Date;

public class SockJSHandlerVerticle extends AbstractVerticle {
  private final ConnectionManager gw;

  public SockJSHandlerVerticle(ConnectionManager gw) {
    this.gw = gw;
  }
  
  @Override
  public void start() throws Exception {

    Router router = Router.router(vertx);

    // We need cookies, sessions and request bodies
    router.route().handler(CookieHandler.create());
    router.route().handler(BodyHandler.create());
    router.route().handler(SessionHandler.create(LocalSessionStore.create(vertx)));

    // Simple auth service which uses a properties file for user/role info
    //AuthProvider authProvider = new MyAuthProvider(vertx);

    // We need a user session handler too to make sure the user is stored in the session between requests
    //router.route().handler(UserSessionHandler.create(authProvider));

    // Allow events for the designated addresses in/out of the event bus bridge
    BridgeOptions opts = new BridgeOptions()
      .addInboundPermitted(new PermittedOptions().setAddress("chat.to.server"))
      .addOutboundPermitted(new PermittedOptions().setAddress("chat.to.client"));

    SockJSHandlerOptions options = new SockJSHandlerOptions().setHeartbeatInterval(2000);
    
    // Create the event bus bridge and add it to the router.
    SockJSHandler sockJSHandler = SockJSHandler.create(vertx, options);
    
    router.route("/eventbus/*").handler(sockJSHandler);

    EventBus eb = vertx.eventBus();
    
    sockJSHandler.bridge(opts, be -> {
      if (be.type() == BridgeEventType.SOCKET_CREATED) {
        System.out.println("Socket create for session: " + be.socket().webSession().id() + " socketWriteId:" + be.socket().writeHandlerID());
        eb.consumer(be.socket().webSession().id()).handler(message -> {
          be.socket().close();
        });
        gw.socketCreated(be.socket().webSession().id());
      } else if (be.type() == BridgeEventType.SOCKET_CLOSED) { 
        System.out.println("Socket closed for: " + be.socket().webSession().id() + " \n   " + be.getRawMessage());
        gw.socketClosed(be.socket().webSession().id());
        eb.consumer(be.socket().webSession().id()).unregister();
      } else if (be.type() == BridgeEventType.SOCKET_IDLE) {
        System.out.println("Socket SOCKET_IDLE for: " + be.socket().webSession().id());
      } else if (be.type() == BridgeEventType.SOCKET_PING) {
        System.out.println("Socket SOCKET_PING for: " + be.socket().webSession().id());
      } else if (be.type() == BridgeEventType.UNREGISTER) {
        System.out.println("Socket UNREGISTER for: " + be.socket().webSession().id() + " \n   " + be.getRawMessage());
      } else if (be.type() == BridgeEventType.PUBLISH) {
        System.out.println("Socket PUBLISH for: " + be.socket().webSession().id() + " \n   " + be.getRawMessage());
      } else if (be.type() == BridgeEventType.RECEIVE) {
        System.out.println("Socket RECEIVE for: " + be.socket().webSession().id() + " \n   " + be.getRawMessage());
      } else if (be.type() == BridgeEventType.SEND) {
        System.out.println("Socket SEND for: " + be.socket().webSession().id() + " \n   " + be.getRawMessage());
        String body = be.getRawMessage().getJsonObject("body").encode();
        gw.onMessageReceived(be.socket().webSession().id(), body);
      } else if (be.type() == BridgeEventType.REGISTER) {
        System.out.println("Socket REGISTER for: " + be.socket().webSession().id() + " \n   " + be.getRawMessage());
        String address = be.getRawMessage().getString("address");
        gw.register(be.socket().webSession().id(), address);
      } else {
        System.out.println("Message from: " + be.socket().webSession().id() + " \n   " + be.getRawMessage());
      }



     // System.out.println("USER=" + be.socket().webUser().principal());
      
      be.complete(true);
    });
    
    // Create a router endpoint for the static content.
    router.route().handler(StaticHandler.create());
   
    // Start the web server and tell it to use the router to handle requests.
    //vertx.createHttpServer(new HttpServerOptions().setSsl(true).setKeyStoreOptions(
    //    new JksOptions().setPath("server-keystore.jks").setPassword("wibble")
    //  )).requestHandler(router::accept).listen(3001);
    vertx.createHttpServer().requestHandler(router::accept).listen(3001);

    // Register to listen for messages coming IN to the server
    eb.consumer("chat.to.server").handler(message -> {
      // Create a timestamp string
    //  String timestamp = DateFormat.getDateTimeInstance(DateFormat.SHORT, DateFormat.MEDIUM).format(Date.from(Instant.now()));
      // Send the message back out to all clients with the timestamp prepended.
      //gw.send("TO ECHO:" + timestamp + ": " + message.body());
     // eb.publish("foofoofoo", message.body());
    });

    //eb.consumer("to-vertx").handler(message -> {
     //eb.publish("chat.to.client", message.body());
    //});

    
    // Serve the non private static pages
    router.route().handler(StaticHandler.create());
  }

}
