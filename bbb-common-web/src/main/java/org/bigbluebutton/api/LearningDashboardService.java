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

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.Calendar;
import java.util.HashSet;
import java.util.Iterator;
import java.util.List;
import java.util.Set;

public class LearningDashboardService {
    private static Logger log = LoggerFactory.getLogger(LearningDashboardService.class);
    private static String learningDashboardFilesDir = "/var/bigbluebutton/learning-dashboard";
    private static String recordingStatusDir = "/var/bigbluebutton/recording/status";
    private static String recordingRawDir = "/var/bigbluebutton/recording/raw";
    // The archive step runs in a queue behind other recording jobs, so it can start well after the
    // cleanup delay. Keep checking until it has finished, but never keep the files longer than this.
    private static final long ARCHIVE_RECHECK_MS = 60 * 1000L;
    private static final long ARCHIVE_WAIT_MAX_MS = 24 * 60 * 60 * 1000L;

    public File getJsonDataFile(String meetingId, String learningDashboardAccessToken) {
        File baseDir = new File(this.getDestinationBaseDirectoryName(meetingId,learningDashboardAccessToken));
        if (!baseDir.exists()) baseDir.mkdirs();

        File jsonFile = new File(baseDir.getAbsolutePath() + File.separatorChar + "learning_dashboard_data.json");
        return jsonFile;
    }

    public void writeJsonDataFile(String meetingId, String learningDashboardAccessToken, String activityJson) {
        FileOutputStream fileOutput = null;
        try {
            if(learningDashboardAccessToken.isEmpty()) {
                log.error("LearningDashboard AccessToken not found. JSON file will not be saved for meeting {}.",meetingId);
                return;
            }

            File jsonFile = this.getJsonDataFile(meetingId,learningDashboardAccessToken);

            fileOutput = new FileOutputStream(jsonFile);
            fileOutput.write(activityJson.getBytes(StandardCharsets.UTF_8));

            log.debug("Learning Dashboard ({}) updated for meeting {}.",jsonFile.getAbsolutePath(),meetingId);
        } catch(Exception e) {
            log.error("Error on updating Learning Dashboard file for meeting [{}]: {}",meetingId, e.getMessage());
        } finally {
            // Ensure the file is closed
            if (fileOutput != null) {
                try {
                    fileOutput.close();
                } catch (IOException e) {
                    log.error("Error on closing Learning Dashboard file for meeting [{}]: {}",meetingId, e.getMessage());
                }
            }
        }
    }

    // meetingIds is the meeting whose Learning Dashboard is being cleaned up, plus (for a parent
    // meeting) the internal IDs of any breakout rooms it had: they share the parent's cleanup delay
    // and are batched into this single scheduled task instead of one Timer thread per room.
    public void removeJsonDataFiles(List<String> meetingIds, int cleanUpDelayMinutes) {

        Calendar cleanUpDelayCalendar = Calendar.getInstance();
        cleanUpDelayCalendar.add(Calendar.MINUTE, cleanUpDelayMinutes);

        long giveUpAt = cleanUpDelayCalendar.getTimeInMillis() + ARCHIVE_WAIT_MAX_MS;
        // Each room is archived as its own recording, so each one waits for its own archive step.
        Set<String> remaining = new HashSet<>(meetingIds);
        Set<String> waitLogged = new HashSet<>();

        //Delay `cleanUpDelayMinutes` then moderators can open the Dashboard before files has been removed
        java.util.Timer timer = new java.util.Timer();
        timer.schedule(
                new java.util.TimerTask() {
                    @Override
                    public void run() {
                        boolean giveUp = System.currentTimeMillis() >= giveUpAt;
                        Iterator<String> it = remaining.iterator();
                        while (it.hasNext()) {
                            String meetingId = it.next();
                            if (isWaitingForArchive(meetingId)) {
                                if (!giveUp) {
                                    if (waitLogged.add(meetingId)) {
                                        log.info("Learning Dashboard files for meeting {} kept until the recording is archived.",meetingId);
                                    }
                                    continue;
                                }
                                log.warn("Recording of meeting {} still not archived; removing its Learning Dashboard files anyway.",meetingId);
                            }
                            File ldMeetingFilesDir = new File(learningDashboardFilesDir + File.separatorChar + meetingId);
                            LearningDashboardService.deleteDirectory(ldMeetingFilesDir);
                            log.info("Learning Dashboard files removed for meeting {}.",meetingId);
                            it.remove();
                        }
                        if (remaining.isEmpty()) timer.cancel();
                    }
                }, cleanUpDelayCalendar.getTime(), ARCHIVE_RECHECK_MS
        );
    }

    private String getDestinationBaseDirectoryName(String meetingId, String learningDashboardAccessToken) {
        return learningDashboardFilesDir + File.separatorChar + meetingId + File.separatorChar + learningDashboardAccessToken;
    }

    private static void deleteDirectory(File directory) {
        /**
         * Go through each directory and check if it's not empty. We need to
         * delete files inside a directory before a directory can be deleted.
         **/
        File[] files = directory.listFiles();
        // listFiles() is null when the directory doesn't exist (e.g. a breakout that never got any
        // Learning Dashboard activity) — skip it instead of throwing and aborting the rest of the batch.
        if (files == null) return;
        for (File file : files) {
            if (file.isDirectory()) {
                deleteDirectory(file);
            } else {
                file.delete();
            }
        }
        // Now that the directory is empty. Delete it.
        directory.delete();
    }

    public void setLearningDashboardFilesDir(String dir) {
        learningDashboardFilesDir = dir;
    }

    // Called with recordStatusDir (.../recording/status/recorded) so the archive status and raw
    // directories are found next to it, as the recording scripts lay them out.
    public void setRecordStatusDir(String dir) {
        File statusDir = new File(dir).getParentFile();
        recordingStatusDir = statusDir.getPath();
        recordingRawDir = new File(statusDir.getParentFile(), "raw").getPath();
    }

    // True while a recorded meeting is queued for archiving or being archived. rap-starter removes
    // the recorded marker once the archive job is queued, but creates the raw directory first, so
    // either one means archive.rb has not yet copied the dashboard file into the recording.
    private static boolean isWaitingForArchive(String meetingId) {
        boolean recorded = new File(recordingStatusDir + File.separatorChar + "recorded", meetingId + ".done").exists()
                || new File(recordingRawDir, meetingId).isDirectory();
        if (!recorded) return false;

        File archivedDir = new File(recordingStatusDir + File.separatorChar + "archived");
        return !(new File(archivedDir, meetingId + ".done").exists()
                || new File(archivedDir, meetingId + ".norecord").exists()
                || new File(archivedDir, meetingId + ".fail").exists());
    }
}
