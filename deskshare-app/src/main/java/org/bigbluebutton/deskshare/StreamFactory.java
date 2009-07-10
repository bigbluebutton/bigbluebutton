package org.bigbluebutton.deskshare;

import org.red5.logging.Red5LoggerFactory;
import org.red5.server.api.IScope;
import org.slf4j.Logger;

public class StreamFactory {
	final private Logger log = Red5LoggerFactory.getLogger(StreamFactory.class, "deskshare");
	
	private DeskShareApplication app;
	
	public DeskShareStream createStream(CaptureStartEvent event) {
		String room = event.getRoom();
		int width = event.getWidth();
		int height = event.getHeight();
		int frameRate = event.getFrameRate();
		
		IScope scope = app.getAppScope().getScope(room);

		log.debug("Created stream {}", scope.getName());
		return new DeskShareStream(scope, room, width, height, frameRate);
	}
	
	public void setDeskShareApplication(DeskShareApplication app) {
		this.app = app;
		if (app == null) {
			log.error("DeskShareApplication is NULL!!!");
		} else {
			log.debug("DeskShareApplication is NOT NULL!!!");
		}
		
	}
}
