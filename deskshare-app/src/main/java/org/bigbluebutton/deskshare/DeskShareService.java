package org.bigbluebutton.deskshare;

import org.red5.logging.Red5LoggerFactory;
import org.red5.server.api.Red5;
import org.slf4j.Logger;

public class DeskShareService {
	final private Logger log = Red5LoggerFactory.getLogger(DeskShareService.class, "deskshare");
	
	private StreamerGateway sg;
	
	public boolean checkIfStreamIsPublishing(){
		String roomName = Red5.getConnectionLocal().getScope().getName();
		log.debug("Checking if {} is streaming.", roomName);
		return sg.isStreaming(roomName);
	}
	
	public int getVideoWidth(){
		String roomName = Red5.getConnectionLocal().getScope().getName();
		log.debug("Getting video width for {}.", roomName);
		return sg.getRoomVideoWidth(roomName);
	}
	
	public int getVideoHeight(){
		String roomName = Red5.getConnectionLocal().getScope().getName();
		log.debug("Getting video height for {}.", roomName);
		return sg.getRoomVideoHeight(roomName);
	}
	
	public void setStreamerGateway(StreamerGateway sg) {
		this.sg = sg;
	}
}
