package org.bigbluebutton.deskshare.server.recorder;

public interface RecordingService {
	/**
	 * Get a recorder for a particular stream
	 * @param name the name of the stream
	 * @return the recorder for the stream
	 */
	Recorder getRecorderFor(String name);
}
