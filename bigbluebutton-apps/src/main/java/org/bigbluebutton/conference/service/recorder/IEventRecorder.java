package org.bigbluebutton.conference.service.recorder;

public interface IEventRecorder {
	public void acceptRecorder(IRecorder recorder);
	public void recordEvent(String message);
	public String getName();
}
