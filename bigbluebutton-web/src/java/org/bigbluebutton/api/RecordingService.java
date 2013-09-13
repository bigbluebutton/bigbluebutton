/**
* BigBlueButton open source conferencing system - http://www.bigbluebutton.org/
* 
* Copyright (c) 2012 BigBlueButton Inc. and by respective authors (see below).
*
* This program is free software; you can redistribute it and/or modify it under the
* terms of the GNU Lesser General Public License as published by the Free Software
* Foundation; either version 3.0 of the License, or (at your option) any later
* version.
* 
* BigBlueButton is distributed in the hope that it will be useful, but WITHOUT ANY
* WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A
* PARTICULAR PURPOSE. See the GNU Lesser General Public License for more details.
*
* You should have received a copy of the GNU Lesser General Public License along
* with BigBlueButton; if not, see <http://www.gnu.org/licenses/>.
*
*/

package org.bigbluebutton.api;

import java.io.File;
import java.io.FileFilter;
import java.io.IOException;
import java.util.ArrayList;

import org.bigbluebutton.api.domain.Recording;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class RecordingService {
	private static Logger log = LoggerFactory.getLogger(RecordingService.class);
	
	private String publishedDir = "/var/bigbluebutton/published";
	private String unpublishedDir = "/var/bigbluebutton/unpublished";
	private RecordingServiceHelper recordingServiceHelper;
	private String recordStatusDir;
	
	public void startIngestAndProcessing(String meetingId) {	
		String done = recordStatusDir + "/" + meetingId + ".done";
	
		File doneFile = new File(done);
		if (!doneFile.exists()) {
			try {
				doneFile.createNewFile();
				if (!doneFile.exists())
					log.error("Failed to create " + done + " file.");
			} catch (IOException e) {
				log.error("Failed to create " + done + " file.");
			}			
		} else {
			log.error(done + " file already exists.");
		}
	}
	
	public ArrayList<Recording> getRecordings(ArrayList<String> meetingIds) {
		ArrayList<Recording> recs = new ArrayList<Recording>();
		
		if(meetingIds.isEmpty()){
			meetingIds.addAll(getAllRecordingIds(publishedDir));
			meetingIds.addAll(getAllRecordingIds(unpublishedDir));
		}
		
		for(String meetingId : meetingIds){
			ArrayList<Recording> published = getRecordingsForPath(meetingId, publishedDir);
			if (!published.isEmpty()) {
				recs.addAll(published);
			}
			
			ArrayList<Recording> unpublished = getRecordingsForPath(meetingId, unpublishedDir);
			if (!unpublished.isEmpty()) {
				recs.addAll(unpublished);
			}	
		}
		
		return recs;
	}
	
	public boolean existAnyRecording(ArrayList<String> idList){
		ArrayList<String> publishList=getAllRecordingIds(publishedDir);
		ArrayList<String> unpublishList=getAllRecordingIds(unpublishedDir);
		
		for(String id:idList){
			if(publishList.contains(id)||unpublishList.contains(id)){
				return true;
			}
		}
		return false;
	}
	
	private ArrayList<String> getAllRecordingIds(String path){
		ArrayList<String> ids=new ArrayList<String>();
		
		String[] format = getPlaybackFormats(path);
		for (int i = 0; i < format.length; i++) {
			File[] recordings = getDirectories(path + File.separatorChar + format[i]);
			for (int f = 0; f < recordings.length; f++) {
				if(!ids.contains(recordings[f].getName()))
					ids.add(recordings[f].getName());				
			}
		}
		return ids;
	}
	
	private ArrayList<Recording> getRecordingsForPath(String meetingId, String path) {
		ArrayList<Recording> recs = new ArrayList<Recording>();
		
		String[] format = getPlaybackFormats(path);
		for (int i = 0; i < format.length; i++) {
			File[] recordings = getDirectories(path + File.separatorChar + format[i]);
			for (int f = 0; f < recordings.length; f++) {
				if (recordings[f].getName().startsWith(meetingId)) {
					Recording r = getRecordingInfo(path, recordings[f].getName(), format[i]);
					if (r != null) recs.add(r);
				}				
			}
		}			
		return recs;
	}
	
	public Recording getRecordingInfo(String recordingId, String format) {
		return getRecordingInfo(publishedDir, recordingId, format);
	}

	private Recording getRecordingInfo(String path, String recordingId, String format) {
		Recording rec = recordingServiceHelper.getRecordingInfo(recordingId, path, format);
		return rec;
	}
	
	public void publish(String recordingId, boolean publish) {
		if(publish)
			publish(unpublishedDir, recordingId, publish);
		else
			publish(publishedDir, recordingId, publish);		
	}
	
	private void publish(String path, String recordingId, boolean publish) {
		String[] format = getPlaybackFormats(path);
		for (int i = 0; i < format.length; i++) {
			File[] recordings = getDirectories(path + File.separatorChar + format[i]);
			for (int f = 0; f < recordings.length; f++) {
				if (recordings[f].getName().equalsIgnoreCase(recordingId)) {
					Recording r = getRecordingInfo(path, recordingId, format[i]);
					if (r != null) {
						File dest;
						if (publish) {
							dest = new File(publishedDir+ File.separatorChar + format[i]);
						} else {
							dest = new File(unpublishedDir+ File.separatorChar + format[i]);
						}
						if(!dest.exists()) dest.mkdir();
						boolean moved = recordings[f].renameTo(new File(dest, recordings[f].getName()));
						if (moved) {
							log.debug("Recording successfully moved!");
							r.setPublished(publish);
							recordingServiceHelper.writeRecordingInfo(dest.getAbsolutePath() + File.separatorChar + recordings[f].getName(), r);
						}
					}
				}				
			}
		}
	}
		
	public void delete(String recordingId) {
		deleteRecording(recordingId, publishedDir);
		deleteRecording(recordingId, unpublishedDir);
	}
	
	private void deleteRecording(String id, String path) {
		String[] format = getPlaybackFormats(path);
		for (int i = 0; i < format.length; i++) {
			File[] recordings = getDirectories(path + File.separatorChar + format[i]);
			for (int f = 0; f < recordings.length; f++) {
				if (recordings[f].getName().equals(id)) {
					deleteDirectory(recordings[f]);
				}				
			}
		}		
	}
	
	private void deleteDirectory(File directory) {
		/**
		 * Go through each directory and check if it's not empty.
		 * We need to delete files inside a directory before a
		 * directory can be deleted.
		**/
		File[] files = directory.listFiles();				
		for (int i = 0; i < files.length; i++) {
			if (files[i].isDirectory()) {
				deleteDirectory(files[i]);
			} else {
				files[i].delete();
			}
		}
		// Now that the directory is empty. Delete it.
		directory.delete();	
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
	
	public void setRecordingStatusDir(String dir) {
		recordStatusDir = dir;
	}
	
	public void setUnpublishedDir(String dir) {
		unpublishedDir = dir;
	}
	
	public void setPublishedDir(String dir) {
		publishedDir = dir;
	}
	
	public void setRecordingServiceHelper(RecordingServiceHelper r) {
		recordingServiceHelper = r;
	}
}
