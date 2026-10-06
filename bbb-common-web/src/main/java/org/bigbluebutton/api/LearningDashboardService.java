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
import java.util.List;

public class LearningDashboardService {
    private static Logger log = LoggerFactory.getLogger(LearningDashboardService.class);
    private static String learningDashboardFilesDir = "/var/bigbluebutton/learning-dashboard";

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

        //Delay `cleanUpDelayMinutes` then moderators can open the Dashboard before files has been removed
        new java.util.Timer().schedule(
                new java.util.TimerTask() {
                    @Override
                    public void run() {
                        for (String meetingId : meetingIds) {
                            File ldMeetingFilesDir = new File(learningDashboardFilesDir + File.separatorChar + meetingId);
                            LearningDashboardService.deleteDirectory(ldMeetingFilesDir);
                            log.info("Learning Dashboard files removed for meeting {}.",meetingId);
                        }
                    }
                }, cleanUpDelayCalendar.getTime()
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
}
