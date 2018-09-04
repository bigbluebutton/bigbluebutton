package org.bigbluebutton.api;

import java.io.File;

import org.apache.commons.codec.digest.DigestUtils;

public final class Util {
	
	public static String generatePresentationId(String name) {
		long timestamp = System.currentTimeMillis();		
		return DigestUtils.sha1Hex(name) + "-" + timestamp;
	}
	
    public static String createNewFilename(String presId, String fileExt) {
        return presId + "." + fileExt;
    }
	
	public static File createPresentationDir(String meetingId, String presentationDir, String presentationId) {
		String meetingPath = presentationDir + File.separatorChar + meetingId + File.separatorChar + meetingId;
		String presPath = meetingPath + File.separatorChar + presentationId;
		File dir = new File(presPath);
		if (dir.mkdirs()) {
			return dir;
		}
		return null;
	}

	public static File getPresentationDir(String presentationBaseDir, String meetingId, String presentationId) {
		String meetingPath = presentationBaseDir + File.separatorChar + meetingId + File.separatorChar + meetingId;
		String presPath = meetingPath + File.separatorChar + presentationId;
		File dir = new File(presPath);
		if (dir.exists()) {
			return dir;
		}
		return null;
	}

	public static File downloadPresentationDirectory(String uploadDirectory) {
		File dir = new File(uploadDirectory + File.separatorChar + "download");
		if (dir.mkdirs()) {
			return dir;
		}
		return null;
	}
}
