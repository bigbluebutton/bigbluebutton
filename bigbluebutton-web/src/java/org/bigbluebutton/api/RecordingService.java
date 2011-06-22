package org.bigbluebutton.api;

import java.io.File;
import java.io.FileFilter;
import java.util.ArrayList;

import org.bigbluebutton.api.domain.Recording;

public class RecordingService {
	private String publishedDir = "/var/bigbluebutton/published";
	private RecordingServiceHelper recordingServiceHelper;
	
	public ArrayList<Recording> getRecordings() {
		ArrayList<Recording> r = new ArrayList<Recording>();
		String[] format = getPlaybackFormats();
		
		return r;
	}
	
	public Recording getRecordingInfo(String recordingId, String format) {
		Recording rec = recordingServiceHelper.getRecordingInfo(recordingId, publishedDir, format);
		return rec;
	}
	
	public void publish(String recordingId) {
		
	}
	
	public void delete(String recordingId) {
		
	}
	
	private File[] getDirectories(String path) {
		File dir = new File(path);

		FileFilter fileFilter = new FileFilter() {
		    public boolean accept(File file) {
		        return file.isDirectory();
		    }
		};
		
		return dir.listFiles(fileFilter);		
	}
	
	private String[] getPlaybackFormats() {
		File[] dirs = getDirectories(publishedDir);
		String[] formats = new String[dirs.length];
		
		for (int i = 0; i < dirs.length; i++) {
			formats[i] = dirs[i].getName();
		}
		return formats;
	}
	
	public void setPublishedDir(String dir) {
		publishedDir = dir;
	}
	
	public void setRecordingServiceHelper(RecordingServiceHelper r) {
		recordingServiceHelper = r;
	}
}
