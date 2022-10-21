package org.bigbluebutton.util;

import org.apache.commons.codec.digest.DigestUtils;

import java.io.File;
import java.util.UUID;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class Util {

    private static final Pattern MEETING_ID_PATTERN = Pattern.compile("^[a-z0-9-]+$");
    private static final Pattern PRES_ID_PATTERN = Pattern.compile("^[a-z0-9-]+$");
    private static final Pattern PRES_FILE_ID_PATTERN = Pattern.compile("^[a-z0-9-]+\\.[a-zA-Z]{3,4}$");

    public static boolean isMeetingIdValidFormat(String id) {
        Matcher matcher = MEETING_ID_PATTERN.matcher(id);
        if (matcher.matches()) {
            return true;
        }
        return false;
    }

    public static String generatePresentationId(String presFilename) {
        long timestamp = System.currentTimeMillis();
        String uuid = UUID.randomUUID().toString();
        return DigestUtils.sha1Hex(presFilename + uuid) + "-" + timestamp;
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

    public static String createNewFilename(String presId, String fileExt) {
        return presId + "." + fileExt;
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

    public static File getPresFileDownloadMarker(File presBaseDir, String presId) {
        if (presBaseDir != null) {
            String downloadMarker = presId.concat(".downloadable");
            return new File(presBaseDir.getAbsolutePath() + File.separatorChar + downloadMarker);
        }
        return null;
    }
}
