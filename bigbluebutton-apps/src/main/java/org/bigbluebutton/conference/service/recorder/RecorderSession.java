package org.bigbluebutton.conference.service.recorder;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

import org.red5.logging.Red5LoggerFactory;
import org.slf4j.Logger;

public class RecorderSession {
	private static Logger log = Red5LoggerFactory.getLogger( RecorderSession.class, "bigbluebutton" );
	
	private final String name;
	private final String conference;
	private IRecorder recorder;
	
	private Map<String, IEventRecorder> recorders;
	
	public RecorderSession(String conference, String room) {
		name = room;
		this.conference = conference;
		recorders = new ConcurrentHashMap<String, IEventRecorder>();
	}
	
	public String getName() {
		return name;
	}
	
	public void addEventRecorder(IEventRecorder r) {
		synchronized (this) {
			if (! recorders.containsKey(r.getName())) {
				r.acceptRecorder(recorder);
				recorders.put(r.getName(), r);
				log.debug("Added event recorder $r.name");
			} else {
				log.debug("Did not add recorder as it's already there.");
			}
		}				
	}
	
	public void setRecorder(IRecorder recorder) {
		this.recorder = recorder;
	}
}
