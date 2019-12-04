package org.bigbluebutton.vertx;

import io.vertx.ext.bridge.BridgeEventType;
import io.vertx.ext.web.handler.sockjs.BridgeOptions;
import io.vertx.ext.web.handler.sockjs.SockJSHandler;

public class SockJSHandlerFactory {

  public  SockJSHandler setupHandler(SockJSHandler ebHandler, BridgeOptions opts) {

    ebHandler.bridge(opts, be -> {
      if (be.type() == BridgeEventType.SOCKET_CREATED) {
        System.out.println("Socket create for: " + be.socket().webSession().id());
      } else if (be.type() == BridgeEventType.SOCKET_CLOSED) {
        System.out.println("Socket closed for: " + be.socket().webSession().id());
      } else {
        System.out.println("Message from: " + be.socket().webSession().id() + " \n   " + be.getRawMessage());
      }
      be.complete(true);
    });
    
    return ebHandler;
  }
}
