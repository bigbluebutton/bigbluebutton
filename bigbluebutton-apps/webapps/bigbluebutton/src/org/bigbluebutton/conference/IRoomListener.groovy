
package org.bigbluebutton.conference

public interface IRoomListener {
	def getName()
	public void participantStatusChange(Long userid, String status, Object value);
	public void participantJoined(Participant participant);
	public void participantLeft(Long userid);
}
