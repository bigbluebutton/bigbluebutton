
package org.bigbluebutton.conference.service.archive.record

import java.util.concurrent.ConcurrentHashMap
import org.slf4j.Logger
import org.slf4j.LoggerFactory
public class RecordSession{
	protected static Logger log = LoggerFactory.getLogger( RecordSession.class )
	
	private final String name
	private final String conference
	private final IRecorder recorder
	
	private Map<String, IEventRecorder> recorders
	
	public RecordSession(String conference, String room) {
		name = room
		this.conference = conference
		recorders = new ConcurrentHashMap<String, IEventRecorder>()
	}
	
	public String getName() {
		return name
	}
	
	public void addEventRecorder(IEventRecorder r) {
		synchronized (this) {
			if (! recorders.containsKey(r.getName())) {
				r.acceptRecorder(recorder)
				recorders.put(r.getName(), r)
				log.debug("Added event recorder $r.name")
			} else {
				log.debug("Did not add recorder as it's already there.")
			}
		}				
	}
	
	public void setRecorder(IRecorder recorder) {
		this.recorder = recorder
	}
}
