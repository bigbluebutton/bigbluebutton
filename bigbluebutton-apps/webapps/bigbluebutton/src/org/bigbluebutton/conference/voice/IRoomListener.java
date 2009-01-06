package org.bigbluebutton.conference.voice;

public interface IRoomListener {
	public void participantJoined(IParticipant p);
	public void participantLeft(IParticipant p);
}
