package org.bigbluebutton.api;

import java.io.File;
import org.apache.commons.codec.digest.DigestUtils;

public final class Util {
	
	public static String generatePresentationId(String name) {
		long timestamp = System.currentTimeMillis();		
		return DigestUtils.shaHex(name) + "-" + timestamp;
	}
	
	public static String getFilenameExt(String filename) {
		return filename.substring(filename.lastIndexOf("."));
	}
	
	public static String createNewFilename(String presId, String fileExt) {
		return presId + fileExt;
	}
	
	public static File createPresentationDirectory(String meetingId, String presentationDir, String presentationId) {
		String meetingPath = presentationDir + File.separatorChar + meetingId + File.separatorChar + meetingId;
		String presPath = meetingPath + File.separatorChar + presentationId;
		File dir = new File(presPath);
		if (dir.mkdirs()) {
			return dir;
		}
		return null;
	}
}
