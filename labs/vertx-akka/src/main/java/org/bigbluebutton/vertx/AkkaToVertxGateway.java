package org.bigbluebutton.vertx;

import io.vertx.core.Vertx;

public class AkkaToVertxGateway implements IAkkaToVertxGateway{

  private final Vertx vertx;

  public AkkaToVertxGateway(Vertx vertx) {
    this.vertx = vertx;
  }
  
  @Override
  public void send(String json) {
    vertx.eventBus().publish("to-vertx", json);
    
  }

}
