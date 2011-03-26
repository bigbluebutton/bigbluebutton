package org.bigbluebutton.deskshare.server.recorder;

import java.util.HashSet;
import java.util.Set;

import org.bigbluebutton.deskshare.server.recorder.event.RecordStatusEvent;

public class RecordStatusListeners {
	private final Set<RecordStatusListener> listeners = new HashSet<RecordStatusListener>();
	
	public void addListener(RecordStatusListener l) {
		listeners.add(l);
	}
	
	public void removeListener(RecordStatusListener l) {
		listeners.remove(l);
	}
	
	public void notifyListeners(RecordStatusEvent event) {
		for (RecordStatusListener listener: listeners) {
			listener.notify(event);
		}
	}
}
