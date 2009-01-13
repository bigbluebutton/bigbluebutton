package org.bigbluebutton.conference.voice;

public interface IRoomEventListener {
	public String getName();
	public void participantJoined(IParticipant p);
	public void participantLeft(IParticipant p);
	public void participantMuted(IParticipant p);
	public void participantTalking(IParticipant p);
}
