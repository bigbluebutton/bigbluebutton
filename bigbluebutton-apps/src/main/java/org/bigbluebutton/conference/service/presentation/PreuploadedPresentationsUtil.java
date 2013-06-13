package org.bigbluebutton.conference.service.presentation;

import java.io.File;
import java.io.FileFilter;
import java.util.ArrayList;

public class PreuploadedPresentationsUtil {

	public ArrayList<String> getPreuploadedPresentations(String meetingID) {
		ArrayList<String> preuploadedPresentations = new ArrayList<String>();
		
		try {
			// TODO: this is hard-coded, and not really a great abstraction.  need to fix this up later
			String folderPath = "/var/bigbluebutton/" + meetingID + "/" + meetingID;
			File folder = new File(folderPath);
			//log.debug("folder: {} - exists: {} - isDir: {}", folder.getAbsolutePath(), folder.exists(), folder.isDirectory());
			if (folder.exists() && folder.isDirectory()) {
				File[] presentations = folder.listFiles(new FileFilter() {
					public boolean accept(File path) {
						return path.isDirectory();
					}
				});
				for (File presFile : presentations) {
					preuploadedPresentations.add(presFile.getName());
				} 
			}
		} catch (Exception ex) {
			
		} 
		
		return preuploadedPresentations;
	}
}
