package org.red5.app.sip;

import org.red5.logging.Red5LoggerFactory;
import org.slf4j.Logger;
import org.zoolu.sip.message.Message;
import org.zoolu.sip.message.MessageFactory;
import org.zoolu.sip.provider.SipProvider;
import org.zoolu.sip.provider.SipProviderListener;

public class OptionMethodListener implements SipProviderListener {

	protected static Logger log = Red5LoggerFactory.getLogger( OptionMethodListener.class, "sip" );
	
	public void onReceivedMessage(SipProvider sip_provider, Message message) {
		// TODO Auto-generated method stub
		if (message.isOption()) {
			log.debug("Received OPTION message");
			Message response = MessageFactory.createResponse(message, 200, "OK", message.getFromHeader().getNameAddress());
			sip_provider.sendMessage(response);
		}
	}

}
