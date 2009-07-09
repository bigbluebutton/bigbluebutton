package org.bigbluebutton.deskshare;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

public class StreamerGateway { 
	private final Map<String, DeskShareStream> dsMap;
	private StreamFactory sf;
	
	public StreamerGateway() {
		dsMap = new ConcurrentHashMap<String, DeskShareStream>();
	}
	
	public void onCaptureStartEvent(CaptureStartEvent event) {
		DeskShareStream stream = sf.createStream(event);
		if (stream != null) {
			dsMap.put(event.getRoom(), stream);
			stream.start();
		} else {
			
		}
	}
	
	public void onCaptureEndEvent(CaptureEndEvent event) {
		DeskShareStream ds = dsMap.remove(event.getRoom());
		if (ds != null) {
			ds.stop();
			ds = null;
		}
	}
	
	public void onCaptureEvent(CaptureEvent event) {
		DeskShareStream ds = dsMap.get(event.getRoom());
		if (ds != null) {
			ds.accept(event);
		}
	}
	
	public void setStreamFactory(StreamFactory sf) {
		this.sf = sf;
	}
}
