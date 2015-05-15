package org.bigbluebutton.conference.service.presentation;

import java.io.File;
import java.io.FileFilter;
import java.io.FilenameFilter;
import java.util.ArrayList;

public class PreuploadedPresentationsUtil {

	private String bbbDir = "/var/bigbluebutton/";
	
	public ArrayList<PreuploadedPresentation> getPreuploadedPresentations(String meetingID) {
		ArrayList<PreuploadedPresentation> preuploadedPresentations = new ArrayList<PreuploadedPresentation>();
		
		try {
			// TODO: this is hard-coded, and not really a great abstraction.  need to fix this up later
			String folderPath = bbbDir  + meetingID + "/" + meetingID;
			File folder = new File(folderPath);
			//log.debug("folder: {} - exists: {} - isDir: {}", folder.getAbsolutePath(), folder.exists(), folder.isDirectory());
			if (folder.exists() && folder.isDirectory()) {
				File[] presentations = folder.listFiles(new FileFilter() {
					public boolean accept(File path) {
						return path.isDirectory();
					}
				});
				for (File presFile : presentations) {
					int numPages = getNumPages(presFile);
					PreuploadedPresentation p = new PreuploadedPresentation(presFile.getName(), numPages);
					preuploadedPresentations.add(p);
				} 
			}
		} catch (Exception ex) {
			
		} 
		
		return preuploadedPresentations;
	}
	
	private int getNumPages(File presDir) {
		File[] files = presDir.listFiles(new FilenameFilter() {			
			@Override
			public boolean accept(File dir, String name) {
				return name.toLowerCase().endsWith(".swf");
			}
		});		
		
		return files.length;
	}
	
	public void setBigBlueButtonDirectory(String dir) {
		if (dir.endsWith("/")) bbbDir = dir;
		else bbbDir = dir + "/";
	}
	
}
