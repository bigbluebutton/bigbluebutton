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
import java.io.FileOutputStream;
import java.util.Calendar;

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

        try {
            if(learningDashboardAccessToken.length() == 0) {
                log.error("LearningDashboard AccessToken not found. JSON file will not be saved for meeting {}.",meetingId);
                return;
            }

            File jsonFile = this.getJsonDataFile(meetingId,learningDashboardAccessToken);

            FileOutputStream fileOutput = new FileOutputStream(jsonFile);
            fileOutput.write(activityJson.getBytes());

            fileOutput.close();

            log.info("Learning Dashboard ({}) updated for meeting {}.",jsonFile.getAbsolutePath(),meetingId);
        } catch(Exception e) {
            System.out.println(e);
        }
    }

    public void removeJsonDataFile(String meetingId, int cleanUpDelayMinutes) {

        Calendar cleanUpDelayCalendar = Calendar.getInstance();
        cleanUpDelayCalendar.add(Calendar.MINUTE, cleanUpDelayMinutes);

        //Delay `cleanUpDelayMinutes` then moderators can open the Dashboard before files has been removed
        new java.util.Timer().schedule(
                new java.util.TimerTask() {
                    @Override
                    public void run() {
                        File ldMeetingFilesDir = new File(learningDashboardFilesDir + File.separatorChar + meetingId);
                        LearningDashboardService.deleteDirectory(ldMeetingFilesDir);
                        log.info("Learning Dashboard files removed for meeting {}.",meetingId);
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
