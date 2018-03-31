package org.bigbluebutton.vertx;

import io.vertx.core.AbstractVerticle;
import io.vertx.core.eventbus.EventBus;
import io.vertx.ext.web.Router;
import io.vertx.ext.web.handler.StaticHandler;
import io.vertx.ext.bridge.BridgeEventType;
import io.vertx.ext.web.handler.sockjs.BridgeOptions;
import io.vertx.ext.web.handler.sockjs.PermittedOptions;
import io.vertx.ext.web.handler.sockjs.SockJSHandler;
import io.vertx.ext.web.handler.sockjs.SockJSHandlerOptions;

import java.text.DateFormat;
import java.time.Instant;
import java.util.Date;

import org.bigbluebutton.VertxToAkkaGateway;


public class ChatVerticle extends AbstractVerticle {
  
  private final VertxToAkkaGateway gw;
  
  public ChatVerticle(VertxToAkkaGateway gw) {
    this.gw = gw;
  }
  
  @Override
  public void start() throws Exception {

    Router router = Router.router(vertx);

    // Allow events for the designated addresses in/out of the event bus bridge
    BridgeOptions opts = new BridgeOptions()
      .addInboundPermitted(new PermittedOptions().setAddress("chat.to.server"))
      .addOutboundPermitted(new PermittedOptions().setAddress("chat.to.client"));

    SockJSHandlerOptions options = new SockJSHandlerOptions().setHeartbeatInterval(2000);
    
    // Create the event bus bridge and add it to the router.
    SockJSHandler ebHandler = SockJSHandler.create(vertx, options); 
    router.route("/eventbus/*").handler(ebHandler);

    // Create a router endpoint for the static content.
    router.route().handler(StaticHandler.create());

    ebHandler.bridge(opts, be -> {
      if (be.type() == BridgeEventType.PUBLISH || be.type() == BridgeEventType.RECEIVE) {
        if (be.getRawMessage().getString("body").equals("armadillos")) {
          // Reject it
          be.complete(false);
          return;
        }
      }
      be.complete(true);
    });
    
    // Start the web server and tell it to use the router to handle requests.
    vertx.createHttpServer().requestHandler(router::accept).listen(3001);

    EventBus eb = vertx.eventBus();

    // Register to listen for messages coming IN to the server
    eb.consumer("chat.to.server").handler(message -> {
      // Create a timestamp string
      String timestamp = DateFormat.getDateTimeInstance(DateFormat.SHORT, DateFormat.MEDIUM).format(Date.from(Instant.now()));
      // Send the message back out to all clients with the timestamp prepended.
      gw.send(timestamp + ": " + message.body());
    });

    eb.consumer("to-vertx").handler(message -> {
      eb.publish("chat.to.client", message.body());
    });    
  }
}
