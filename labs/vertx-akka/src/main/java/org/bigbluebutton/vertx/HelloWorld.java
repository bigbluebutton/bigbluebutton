package org.bigbluebutton.vertx;

import org.bigbluebutton.ConnectionManager;
import org.bigbluebutton.VertxToAkkaGateway;

import io.vertx.core.Vertx;

public class HelloWorld {
  
  private final Vertx vertx;
  private final VertxToAkkaGateway gw;
  private final ConnectionManager cm;

  public HelloWorld(Vertx vertx, VertxToAkkaGateway gw, ConnectionManager cm)  {
    this.vertx = vertx;
    this.gw = gw;
    this.cm = cm;
  }
  
  public void startup() {
    // Create an HTTP server which simply returns "Hello World!" to each request.
    //Vertx.vertx().createHttpServer().requestHandler(req -> req.response().end("Hello World! from gradle.")).listen(3000);
  
    //vertx.deployVerticle(new ChatVerticle(gw));
    //vertx.deployVerticle(new RealtimeVerticle());
    //vertx.deployVerticle(new AuthenticateVerticle());
    
    //vertx.deployVerticle(new PrivateVerticle(gw));
    vertx.deployVerticle(new SockJSHandlerVerticle(cm));
    //vertx.deployVerticle(new SimpleREST());
    //vertx.deployVerticle(new BbbApi());
  }

  
}
