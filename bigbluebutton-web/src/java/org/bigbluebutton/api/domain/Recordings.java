package org.bigbluebutton.api.domain;

import java.io.File;
import java.io.FileFilter;

public class Recordings {
	
	public String[] getRecordings(String recordingDir) {
		File dir = new File(recordingDir);

		FileFilter fileFilter = new FileFilter() {
		    public boolean accept(File file) {
		        return file.isDirectory();
		    }
		};
		
		File[] dirs = dir.listFiles(fileFilter);
		String[] meetings = new String[dirs.length];
		
		for (int i = 0; i < dirs.length; i++) {
			meetings[i] = dirs[i].getName();
		}
		return meetings;
	}
}
