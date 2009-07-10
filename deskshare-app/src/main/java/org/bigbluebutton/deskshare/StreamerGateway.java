package org.bigbluebutton.deskshare;

import java.util.ArrayList;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

import org.red5.server.api.so.ISharedObject;

public class StreamerGateway { 
	private final Map<String, DeskShareStream> dsMap;
	private StreamFactory sf;
	private DeskShareApplication app;
	
	public StreamerGateway() {
		dsMap = new ConcurrentHashMap<String, DeskShareStream>();
	}
	
	public void onCaptureStartEvent(CaptureStartEvent event) {
		DeskShareStream stream = sf.createStream(event);

		dsMap.put(event.getRoom(), stream);
		stream.start();
			
		//notify the clients in the room that the stream has now started broadcasting.
		ISharedObject deskSO = app.getSharedObject(stream.getScope(), "deskSO");
		deskSO.sendMessage("appletStarted" , new ArrayList<Object>());

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

	public boolean isStreaming(String room){
		DeskShareStream ds = dsMap.get(room);
		if (ds != null) {
			return true;
		}
		return false;
	}
	
	public int getRoomVideoWidth(String room){
		DeskShareStream ds = dsMap.get(room);
		if (ds != null) {
			return ds.getWidth();
		}
		return 0;
	}
	
	public int getRoomVideoHeight(String room){
		DeskShareStream ds = dsMap.get(room);
		if (ds != null) {
			return ds.getHeight();
		}
		return 0;
	}	
	
	public void setStreamFactory(StreamFactory sf) {
		this.sf = sf;
	}
	
	public void setDeskShareApplication(DeskShareApplication app) {
		this.app = app;
	}
}
