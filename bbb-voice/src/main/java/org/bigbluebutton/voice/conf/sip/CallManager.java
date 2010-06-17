package org.bigbluebutton.voice.conf.sip;

import java.util.Collection;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

public class CallManager {

	private final Map<String, CallAgent> calls = new ConcurrentHashMap<String, CallAgent>();
	
	public CallAgent add(CallAgent ca) {
		return calls.put(ca.getCallId(), ca);
	}
	
	public CallAgent remove(CallAgent ca) {
		return calls.remove(ca.getCallId());
	}
	
	public CallAgent get(String id) {
		return calls.get(id);
	}
	
	public Collection<CallAgent> getAll() {
		return calls.values();
	}
}
