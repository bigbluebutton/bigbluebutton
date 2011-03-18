package org.bigbluebutton.deskshare.server.recorder;

public interface RecordingService {
	void recordFrame(String stream, byte[] data);
	void startRecording(String stream);
	void stopRecording(String stream);
}
