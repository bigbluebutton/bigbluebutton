package org.bigbluebutton.api;

import java.io.File;

import org.apache.commons.codec.digest.DigestUtils;

public final class Util {
    
    private Util() {
      throw new IllegalStateException("Utility class");
    }
	
	public static String generatePresentationId(String name) {
		long timestamp = System.currentTimeMillis();		
		return DigestUtils.sha1Hex(name) + "-" + timestamp;
	}


	public static String generateFileId(String name) {
		return generatePresentationId(name);
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

	public static File createFileUploadDir(String meetingId, String fileUploadDir, String fileId, boolean returnOnExists) {
		String meetingPath = fileUploadDir + File.separatorChar + meetingId + File.separatorChar + meetingId;
		String presPath = meetingPath + File.separatorChar + fileId;
		File dir = new File(presPath);
		if (dir.mkdirs()) {
			return dir;
		}
		if(returnOnExists)
			return dir;
		else
			return null;
	}


	public static File downloadFileDirectory(String fileUploadDirectory) {
		File dir = new File(fileUploadDirectory + File.separatorChar + "download");
		if (dir.mkdirs()) {
			return dir;
		}
		return null;
	}
}
