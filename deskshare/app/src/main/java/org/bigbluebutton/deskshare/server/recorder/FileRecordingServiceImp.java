package org.bigbluebutton.deskshare.server.recorder;

public class FileRecordingServiceImp implements RecordingService {

	String recordingDir;
	
	@Override
	public Recorder getRecorderFor(String name) {
		return new FileRecorder(name, recordingDir);
	}

	/**
	 * Set the location of where the recorded files will be stored
	 * @param path The absolute path of where the files will be stored
	 */
	public void setRecordingDirectory(String path) {
		recordingDir = path;
	}

}
