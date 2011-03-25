package org.bigbluebutton.deskshare.server.recorder;

import java.io.File;
import org.red5.logging.Red5LoggerFactory;
import org.slf4j.Logger;

public class FileRecordingServiceImp implements RecordingService {
	final private Logger log = Red5LoggerFactory.getLogger(FileRecordingServiceImp.class, "deskshare");
	
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
		File f = new File(path);
		if (!f.exists()) {
			try {
				if (!f.mkdirs()) {
					log.error("Failed to create recording directory [" + path + "]");
				}
			} catch (SecurityException ex) {
				log.error("Security Error. Failed to create recording directory [" + path + "].");
			}
		}
		
		recordingDir = path;
	}

}
