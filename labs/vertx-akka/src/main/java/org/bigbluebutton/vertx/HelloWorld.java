package org.bigbluebutton.vertx;

import org.bigbluebutton.VertxToAkkaGateway;

import io.vertx.core.Vertx;

public class HelloWorld {
  
  private final Vertx vertx;
  private final VertxToAkkaGateway gw;
  
  public HelloWorld(Vertx vertx, VertxToAkkaGateway gw)  {
    this.vertx = vertx;
    this.gw = gw;
  }
  
  public void startup() {
    // Create an HTTP server which simply returns "Hello World!" to each request.
    //Vertx.vertx().createHttpServer().requestHandler(req -> req.response().end("Hello World! from gradle.")).listen(3000);
  
    //vertx.deployVerticle(new ChatVerticle(gw));
    //vertx.deployVerticle(new RealtimeVerticle());
    //vertx.deployVerticle(new AuthenticateVerticle());
    
    vertx.deployVerticle(new PrivateVerticle(gw));
    //vertx.deployVerticle(new SimpleREST());
    //vertx.deployVerticle(new BbbApi());
  }

  
}
