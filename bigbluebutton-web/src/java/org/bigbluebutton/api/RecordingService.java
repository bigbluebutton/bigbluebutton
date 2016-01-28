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
import java.util.Arrays;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Map;

import org.bigbluebutton.api.domain.Recording;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class RecordingService {
    private static Logger log = LoggerFactory.getLogger(RecordingService.class);

    private String processDir = "/var/bigbluebutton/recording/process";
    private String publishedDir = "/var/bigbluebutton/published";
    private String unpublishedDir = "/var/bigbluebutton/unpublished";
    private String deletedDir = "/var/bigbluebutton/deleted";
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

    private boolean shouldIncludeState(ArrayList<String> states, String type) {
        boolean r = false;

        if (!states.isEmpty()) {
            if (states.contains("any")) {
                r = true;
            } else {
                if (type.equals(Recording.STATE_PUBLISHED)
                        && states.contains(Recording.STATE_PUBLISHED)) {
                    r = true;
                } else if (type.equals(Recording.STATE_UNPUBLISHED)
                        && states.contains(Recording.STATE_UNPUBLISHED)) {
                    r = true;
                } else if (type.equals(Recording.STATE_DELETED)
                        && states.contains(Recording.STATE_DELETED)) {
                    r = true;
                } else if (type.equals(Recording.STATE_PROCESSING)
                        && states.contains(Recording.STATE_PROCESSING)) {
                    r = true;
                } else if (type.equals(Recording.STATE_PROCESSED)
                        && states.contains(Recording.STATE_PROCESSED)) {
                    r = true;
                }
            }

        } else {
            if (type.equals(Recording.STATE_PUBLISHED)
                    || type.equals(Recording.STATE_UNPUBLISHED)) {
                r = true;
            }
        }

        return r;
    }

    public ArrayList<Recording> getRecordings(ArrayList<String> recordIDs,
            ArrayList<String> states) {
        ArrayList<Recording> recs = new ArrayList<Recording>();

        if (recordIDs.isEmpty()) {
            if (shouldIncludeState(states, Recording.STATE_PUBLISHED))
                recordIDs.addAll(getAllRecordingIds(publishedDir));

            if (shouldIncludeState(states, Recording.STATE_UNPUBLISHED))
                recordIDs.addAll(getAllRecordingIds(unpublishedDir));

            if (shouldIncludeState(states, Recording.STATE_DELETED))
                recordIDs.addAll(getAllRecordingIds(deletedDir));

            if (shouldIncludeState(states, Recording.STATE_PROCESSING))
                recordIDs.addAll(getAllRecordingIds(processDir));

            if (shouldIncludeState(states, Recording.STATE_PROCESSED))
                recordIDs.addAll(getAllRecordingIds(processDir));

        }

        for (String recordID : recordIDs) {
            if (shouldIncludeState(states, Recording.STATE_PUBLISHED)) {
                ArrayList<Recording> published = getRecordingsForPath(recordID,
                        publishedDir);
                if (!published.isEmpty()) {
                    recs.addAll(published);
                }
            }

            if (shouldIncludeState(states, Recording.STATE_UNPUBLISHED)) {
                ArrayList<Recording> unpublished = getRecordingsForPath(
                        recordID, unpublishedDir);
                if (!unpublished.isEmpty()) {
                    recs.addAll(unpublished);
                }
            }

            if (shouldIncludeState(states, Recording.STATE_DELETED)) {
                ArrayList<Recording> deleted = getRecordingsForPath(recordID,
                        deletedDir);
                if (!deleted.isEmpty()) {
                    recs.addAll(deleted);
                }
            }

            if (shouldIncludeState(states, Recording.STATE_PROCESSING)) {
                ArrayList<Recording> processing = getRecordingsForPath(
                        recordID, processDir);
                if (!processing.isEmpty()) {
                    recs.addAll(processing);
                }
            }

            if (shouldIncludeState(states, Recording.STATE_PROCESSED)) {
                ArrayList<Recording> processed = getRecordingsForPath(recordID,
                        processDir);
                if (!processed.isEmpty()) {
                    recs.addAll(processed);
                }
            }
        }

        return recs;
    }

    public boolean recordingMatchesMetadata(Recording recording,
            Map<String, String> metadataFilters) {
        for (Map.Entry<String, String> filter : metadataFilters.entrySet()) {
            String metadataValue = recording.getMetadata().get(filter.getKey());
            if (metadataValue != null
                    && metadataValue.equals(filter.getValue())) {
                // the recording has the metadata specified
                // AND the value is the same as the filter
            } else {
                return false;
            }
        }
        return true;
    }

    public Map<String, Recording> filterRecordingsByMetadata(
            Map<String, Recording> recordings,
            Map<String, String> metadataFilters) {
        Map<String, Recording> resultRecordings = new HashMap<String, Recording>();
        for (Map.Entry<String, Recording> entry : recordings.entrySet()) {
            if (recordingMatchesMetadata(entry.getValue(), metadataFilters))
                resultRecordings.put(entry.getKey(), entry.getValue());
        }
        return resultRecordings;
    }

    public boolean existAnyRecording(ArrayList<String> idList) {
        ArrayList<String> publishList = getAllRecordingIds(publishedDir);
        ArrayList<String> unpublishList = getAllRecordingIds(unpublishedDir);

        for (String id : idList) {
            if (publishList.contains(id) || unpublishList.contains(id)) {
                return true;
            }
        }
        return false;
    }

    private ArrayList<String> getAllRecordingIds(String path) {
        ArrayList<String> ids = new ArrayList<String>();

        String[] format = getPlaybackFormats(path);
        for (int i = 0; i < format.length; i++) {
            File[] recordings = getDirectories(path + File.separatorChar
                    + format[i]);
            for (int f = 0; f < recordings.length; f++) {
                if (!ids.contains(recordings[f].getName()))
                    ids.add(recordings[f].getName());
            }
        }
        return ids;
    }

    private ArrayList<Recording> getRecordingsForPath(String recordingId,
            String path) {
        ArrayList<Recording> recs = new ArrayList<Recording>();

        String[] format = getPlaybackFormats(path);
        for (int i = 0; i < format.length; i++) {
            File[] recordings = getDirectories(path + File.separatorChar
                    + format[i]);
            for (int f = 0; f < recordings.length; f++) {
                if (recordings[f].getName().startsWith(recordingId)) {
                    Recording r = getRecordingInfo(path,
                            recordings[f].getName(), format[i]);
                    recs.add(r);
                }
            }
        }
        return recs;
    }

    private Recording getRecordingInfo(String path, String recordingId,
            String format) {
        Recording rec = recordingServiceHelper.getRecordingInfo(recordingId,
                path, format);
        return rec;
    }

    public void changeState(String recordingId, String state) {
        if (state.equals(Recording.STATE_PUBLISHED)) {
            // It can only be published if it is unpublished
            changeState(unpublishedDir, recordingId, state);
        } else if (state.equals(Recording.STATE_UNPUBLISHED)) {
            // It can only be unpublished if it is published
            changeState(publishedDir, recordingId, state);
        }
        if (state.equals(Recording.STATE_DELETED)) {
            // It can be deleted from any state
            changeState(publishedDir, recordingId, state);
            changeState(unpublishedDir, recordingId, state);
            changeState(deletedDir, recordingId, state);
        }
    }

    private void changeState(String path, String recordingId, String state) {
        String[] format = getPlaybackFormats(path);
        for (int i = 0; i < format.length; i++) {
            File[] recordings = getDirectories(path + File.separatorChar
                    + format[i]);
            for (int f = 0; f < recordings.length; f++) {
                if (recordings[f].getName().equalsIgnoreCase(recordingId)) {
                    Recording r = getRecordingInfo(path, recordingId, format[i]);
                    if (r != null) {
                        File dest;
                        if (state.equals(Recording.STATE_PUBLISHED)) {
                            dest = new File(publishedDir + File.separatorChar
                                    + format[i]);
                        } else if (state.equals(Recording.STATE_UNPUBLISHED)) {
                            dest = new File(unpublishedDir + File.separatorChar
                                    + format[i]);
                        } else if (state.equals(Recording.STATE_DELETED)) {
                            dest = new File(deletedDir + File.separatorChar
                                    + format[i]);
                        } else {
                            log.debug(String.format(
                                    "State: %s, is not supported", state));
                            return;
                        }
                        if (!dest.exists())
                            dest.mkdir();
                        boolean moved = recordings[f].renameTo(new File(dest,
                                recordings[f].getName()));
                        if (moved) {
                            log.debug("Recording successfully moved!");
                            r.setState(state);
                            r.setPublished(state
                                    .equals(Recording.STATE_PUBLISHED));
                            if (state.equals(Recording.STATE_DELETED)) {
                                r.setPlaybackFormat(null);
                                deleteRecording(recordingId, deletedDir);
                            }
                            recordingServiceHelper.writeRecordingInfo(
                                    dest.getAbsolutePath() + File.separatorChar
                                            + recordings[f].getName(), r);
                            log.debug(String.format(
                                    "Recording successfully %s!", state));
                        } else {
                            log.debug("Recording was not moved");
                        }
                    }
                }
            }
        }
    }

    private void deleteRecording(String id, String path) {
        String[] format = getPlaybackFormats(path);
        for (int i = 0; i < format.length; i++) {
            File[] recordings = getDirectories(path + File.separatorChar
                    + format[i]);
            for (int f = 0; f < recordings.length; f++) {
                if (recordings[f].getName().equals(id)) {
                    deleteDirectory(recordings[f]);
                    createDirectory(recordings[f]);
                }
            }
        }
    }

    private void createDirectory(File directory) {
        if (!directory.exists())
            directory.mkdir();
    }

    private void deleteDirectory(File directory) {
        /**
         * Go through each directory and check if it's not empty. We need to
         * delete files inside a directory before a directory can be deleted.
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
