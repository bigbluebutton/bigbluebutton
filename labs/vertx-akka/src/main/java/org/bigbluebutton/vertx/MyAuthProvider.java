package org.bigbluebutton.vertx;

import org.bigbluebutton.VertxToAkkaGateway;

import io.vertx.core.AsyncResult;
import io.vertx.core.Handler;
import io.vertx.core.Vertx;
import io.vertx.core.eventbus.DeliveryOptions;
import io.vertx.core.json.JsonArray;
import io.vertx.core.json.JsonObject;
import io.vertx.ext.auth.AuthProvider;
import io.vertx.ext.auth.User;
import io.vertx.core.Future;

public class MyAuthProvider implements AuthProvider {

	private final Vertx vertx;
	
	public MyAuthProvider(Vertx vertx) {
		this.vertx = vertx;
	}
	
  @Override
  public void authenticate(JsonObject user, Handler<AsyncResult<User>> resultHandler) {
    JsonObject object = new JsonObject();
    object.put("foo", "bar").put("num", 123).put("mybool", true);
    
    JsonArray array = new JsonArray();
    array.add("foo").add(123).add(false);
    
    DeliveryOptions options = new DeliveryOptions();
    options.setSendTimeout(5000);
    
    vertx.eventBus().send("to-akka-gw", 
    		"Yay! Someone kicked a ball across a patch of grass", 
    		options, ar -> {
    	  if (ar.succeeded()) {
    	    System.out.println("Received reply: " + ar.result().body());
        	System.out.println("Got Authenticated");
        	resultHandler.handle(Future.succeededFuture(new BbbUser(object, array)));
    	  }
    	});
  }

}
