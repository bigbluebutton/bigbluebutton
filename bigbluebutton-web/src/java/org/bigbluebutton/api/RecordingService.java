package org.bigbluebutton.api;

import java.io.File;
import java.io.FileFilter;
import java.util.ArrayList;

import org.bigbluebutton.api.domain.Recording;

public class RecordingService {
	private String publishedDir = "/var/bigbluebutton/published";
	private String unpublishedDir = "/var/bigbluebutton/unpublished";
	private RecordingServiceHelper recordingServiceHelper;
	
	public ArrayList<Recording> getRecordings(String meetingId) {
		ArrayList<Recording> recs = new ArrayList<Recording>();
		
		ArrayList<Recording> published = getRecordingsForPath(meetingId, publishedDir);
		if (!published.isEmpty()) {
			recs.addAll(published);
		}
		
		ArrayList<Recording> unpublished = getRecordingsForPath(meetingId, unpublishedDir);
		if (!unpublished.isEmpty()) {
			recs.addAll(unpublished);
		}
		
		return recs;
	}
	
	private ArrayList<Recording> getRecordingsForPath(String meetingId, String path) {
		ArrayList<Recording> recs = new ArrayList<Recording>();
		
		String[] format = getPlaybackFormats(path);
		for (int i = 0; i < format.length; i++) {
			File[] recordings = getDirectories(publishedDir + File.pathSeparatorChar + format[i]);
			for (int f = 0; f < recordings.length; f++) {
				if (recordings[f].getName().startsWith(meetingId)) {
					Recording r = getRecordingInfo(recordings[f].getName(), format[i]);
					if (r != null) recs.add(r);
				}				
			}
		}	
		
		return recs;
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
	
	private String[] getPlaybackFormats(String path) {
		File[] dirs = getDirectories(path);
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
