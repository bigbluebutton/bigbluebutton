package org.bigbluebutton.vertx;


import io.vertx.core.Vertx;
import io.vertx.core.eventbus.Message;
import io.vertx.core.eventbus.MessageConsumer;
import io.vertx.core.json.JsonObject;

import org.bigbluebutton.VertxToAkkaGateway;

public class VertxToAkkaBus {

	
	public VertxToAkkaBus(Vertx vertx, VertxToAkkaGateway gw) {
		
		MessageConsumer<String> consumer = 
				vertx.eventBus().consumer("to-akka-gw");
		
		consumer.handler(message -> {
			System.out.println("I have received a message: " + message.body());
			if (message.replyAddress() != null) {
				String replyChannel = "reply-channel";
				MessageConsumer<String> replyConsumer = 
						vertx.eventBus().consumer(replyChannel);
				replyConsumer.handler(replyMessage -> {
				    	System.out.println("Got Authenticated");
				    	
				    	message.reply(replyMessage.body().toString());
				    	replyConsumer.unregister();
				    });
				  gw.sendWithReply(message.body().toString(), replyChannel);   
			  } else {
				  gw.send(message.body().toString());
			  }
		  
		});
		
	}
}
