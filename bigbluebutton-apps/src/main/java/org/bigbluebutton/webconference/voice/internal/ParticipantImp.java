package org.bigbluebutton.webconference.voice.internal;

import org.bigbluebutton.webconference.voice.Participant;

import net.jcip.annotations.ThreadSafe;

@ThreadSafe
class ParticipantImp implements Participant {
	private final int id;
	private final String name;
	private boolean muted = false;
	private boolean talking = false;
	
	ParticipantImp(int id, String name) {
		this.id = id;
		this.name = name;
	}
	
	synchronized void setTalking(boolean talking) {
		this.talking = talking;
	}

	synchronized void setMuted(boolean muted) {
		this.muted = muted;
	}
	
	synchronized public boolean isMuted() {
		return muted;
	}

	synchronized public boolean isTalking() {
		return talking;
	}

	public int getId() {
		return id;
	}

	public String getName() {
		return name;
	}
}
