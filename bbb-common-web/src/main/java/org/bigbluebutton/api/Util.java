package org.bigbluebutton.api;

import java.io.File;
import java.io.IOException;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import org.apache.commons.codec.digest.DigestUtils;
import org.apache.commons.lang3.StringUtils;

public final class Util {

	private static final Pattern MEETING_ID_PATTERN = Pattern.compile("^[a-z0-9-]+$");
	private static final Pattern PRES_ID_PATTERN = Pattern.compile("^[a-z0-9-]+$");
	// see https://www.baeldung.com/java-regexp-escape-char#1-escaping-using-backslash
	private static final Pattern PRES_FILE_ID_PATTERN = Pattern.compile("^[a-z0-9-]+\\.[a-zA-Z]{3,4}$");

	private Util() {
		throw new IllegalStateException("Utility class");
	}

	public static boolean isMeetingIdValidFormat(String id) {
		Matcher matcher = MEETING_ID_PATTERN.matcher(id);
		if (matcher.matches()) {
			return true;
		}
		return false;
	}

	public static boolean isPresIdValidFormat(String id) {
		Matcher matcher = PRES_ID_PATTERN.matcher(id);
		if (matcher.matches()) {
			return true;
		}
		return false;
	}

	public static boolean isPresFileIdValidFormat(String id) {
		Matcher matcher = PRES_FILE_ID_PATTERN.matcher(id);
		if (matcher.matches()) {
			return true;
		}
		return false;
	}

	public static String generatePresentationId(String presFilename) {
		long timestamp = System.currentTimeMillis();
		return DigestUtils.sha1Hex(presFilename) + "-" + timestamp;
	}

	public static String createNewFilename(String presId, String fileExt) {
		return presId + "." + fileExt;
	}
	
	public static File createPresentationDir(String meetingId, String presentationDir, String presentationId) {
		if (Util.isMeetingIdValidFormat(meetingId) && Util.isPresIdValidFormat(presentationId)) {
			String meetingPath = presentationDir + File.separatorChar + meetingId + File.separatorChar + meetingId;
			String presPath = meetingPath + File.separatorChar + presentationId;
			File dir = new File(presPath);
			if (dir.mkdirs()) {
				return dir;
			}
		}

		return null;
	}

	public static File getMeetingDirPath(String presentationBaseDir, String meetingId) {
		if (Util.isMeetingIdValidFormat(meetingId)) {
			String meetingPath = presentationBaseDir + File.separatorChar + meetingId + File.separatorChar + meetingId;
			File dir = new File(meetingPath);
			if (dir.isDirectory() && dir.exists()) {
				return dir;
			}
		}

		return null;
	}

	public static File getPresentationDir(String presentationBaseDir, String meetingId, String presentationId) {
		if (Util.isMeetingIdValidFormat(meetingId) && Util.isPresIdValidFormat(presentationId)) {
			String meetingPath = presentationBaseDir + File.separatorChar + meetingId + File.separatorChar + meetingId;
			String presPath = meetingPath + File.separatorChar + presentationId;
			File dir = new File(presPath);
			if (dir.isDirectory() && dir.exists()) {
				return dir;
			}
		}

		return null;
	}

	public String stripPresBaseDirFromPath(String presentationBaseDir, String path) {
		if (path.startsWith(presentationBaseDir)) {
			String presBaseDir = presentationBaseDir;
			if (! presBaseDir.endsWith("/")) {
				presBaseDir = presBaseDir.concat("/");
				return StringUtils.removeStart(path, presBaseDir);
			} else {
				return StringUtils.removeStart(path, presBaseDir);
			}
		}
		return path;
	}

	public static File getPresFileDownloadMarker(File presBaseDir, String presId) {
		if (presBaseDir != null) {
			String downloadMarker = presId.concat(".downloadable");
			return new File(presBaseDir.getAbsolutePath() + File.separatorChar + downloadMarker);
		}
		return null;
	}

	public static void makePresentationDownloadable(
		File presFileDir,
		String presId,
		boolean downloadable
	) throws IOException {
		File downloadMarker = Util.getPresFileDownloadMarker(presFileDir, presId);
		if (downloadable) {
			if (downloadMarker != null && ! downloadMarker.exists()) {
				downloadMarker.createNewFile();
			}
		} else {
			if (downloadMarker != null && downloadMarker.exists()) {
				downloadMarker.delete();
			}
		}
	}
}
