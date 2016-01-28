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
import java.nio.file.DirectoryStream;
import java.nio.file.FileSystems;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.Collection;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.Set;

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

        List<File> allPublishedDirectories = new ArrayList<File>();
        String[] publishedFormats = getPlaybackFormats(publishedDir);
        for (int i = 0; i < publishedFormats.length; ++i) {
            allPublishedDirectories.addAll(getDirectories(publishedDir
                    + File.separatorChar + publishedFormats[i]));
        }

        List<File> allUnpublishedDirectories = new ArrayList<File>();
        String[] unpublishedFormats = getPlaybackFormats(unpublishedDir);
        for (int i = 0; i < unpublishedFormats.length; ++i) {
            allUnpublishedDirectories.addAll(getDirectories(unpublishedDir
                    + File.separatorChar + unpublishedFormats[i]));
        }

        if (meetingIds.isEmpty()) {
            meetingIds.addAll(getAllRecordingIds(allPublishedDirectories));
            meetingIds.addAll(getAllRecordingIds(allUnpublishedDirectories));
        }

        log.debug("got all recording ids");

        for (String meetingId : meetingIds) {
            List<Recording> published = getRecordingsForPath(meetingId,
                    allPublishedDirectories);
            if (!published.isEmpty()) {
                recs.addAll(published);
            }

            List<Recording> unpublished = getRecordingsForPath(meetingId,
                    allUnpublishedDirectories);
            if (!unpublished.isEmpty()) {
                recs.addAll(unpublished);
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

    public boolean existAnyRecording(List<String> idList) {
        List<String> publishList = getAllRecordingIds(publishedDir);
        List<String> unpublishList = getAllRecordingIds(unpublishedDir);

        for (String id : idList) {
            if (publishList.contains(id) || unpublishList.contains(id)) {
                return true;
            }
        }
        return false;
    }

    private List<String> getAllRecordingIds(String path) {
        String[] format = getPlaybackFormats(path);

        return getAllRecordingIds(path, format);
    }

    private List<String> getAllRecordingIds(String path, String[] format) {
        List<String> ids = new ArrayList<String>();

        for (int i = 0; i < format.length; i++) {
            List<File> recordings = getDirectories(path + File.separatorChar
                    + format[i]);
            for (int f = 0; f < recordings.size(); f++) {
                if (!ids.contains(recordings.get(f).getName()))
                    ids.add(recordings.get(f).getName());
            }
        }
        return ids;
    }

    private Set<String> getAllRecordingIds(List<File> recs) {
        Set<String> ids = new HashSet<String>();

        Iterator<File> iterator = recs.iterator();
        while (iterator.hasNext()) {
            ids.add(iterator.next().getName());
        }
        return ids;
    }

    private List<Recording> getRecordingsForPath(String meetingId, String path) {
        List<Recording> recs = new ArrayList<Recording>();

        String[] format = getPlaybackFormats(path);
        for (int i = 0; i < format.length; i++) {
            List<File> recordings = getDirectories(path + File.separatorChar
                    + format[i]);
            for (int f = 0; f < recordings.size(); f++) {
                if (recordings.get(f).getName().startsWith(meetingId)) {
                    Recording r = getRecordingInfo(path, recordings.get(f)
                            .getName(), format[i]);
                    if (r != null)
                        recs.add(r);
                }
            }
        }
        return recs;
    }

    private List<Recording> getRecordingsForPath(String meetingId,
            List<File> recordings) {
        List<Recording> recs = new ArrayList<Recording>();

        Iterator<File> iterator = recordings.iterator();
        while (iterator.hasNext()) {
            File recording = iterator.next();
            if (recording.getName().startsWith(meetingId)) {
                Recording r = getRecordingInfo(recording);
                if (r != null)
                    recs.add(r);
            }
        }
        return recs;
    }

    public Recording getRecordingInfo(String recordingId, String format) {
        return getRecordingInfo(publishedDir, recordingId, format);
    }

    private Recording getRecordingInfo(String path, String recordingId,
            String format) {
        Recording rec = recordingServiceHelper.getRecordingInfo(recordingId,
                path, format);
        return rec;
    }

    private Recording getRecordingInfo(File dir) {
        Recording rec = recordingServiceHelper.getRecordingInfo(dir);
        return rec;
    }

    public void publish(String recordingId, boolean publish) {
        if (publish)
            publish(unpublishedDir, recordingId, publish);
        else
            publish(publishedDir, recordingId, publish);
    }

    private void publish(String path, String recordingId, boolean publish) {
        String[] format = getPlaybackFormats(path);
        for (int i = 0; i < format.length; i++) {
            List<File> recordings = getDirectories(path + File.separatorChar
                    + format[i]);
            for (int f = 0; f < recordings.size(); f++) {
                File recording = recordings.get(f);
                if (recording.getName().equalsIgnoreCase(recordingId)) {
                    Recording r = getRecordingInfo(path, recordingId, format[i]);
                    if (r != null) {
                        File dest;
                        if (publish) {
                            dest = new File(publishedDir + File.separatorChar
                                    + format[i]);
                        } else {
                            dest = new File(unpublishedDir + File.separatorChar
                                    + format[i]);
                        }
                        if (!dest.exists())
                            dest.mkdir();
                        boolean moved = recording.renameTo(new File(dest,
                                recording.getName()));
                        if (moved) {
                            log.debug("Recording successfully moved!");
                            r.setPublished(publish);
                            recordingServiceHelper.writeRecordingInfo(
                                    dest.getAbsolutePath() + File.separatorChar
                                            + recording.getName(), r);
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
            List<File> recordings = getDirectories(path + File.separatorChar
                    + format[i]);
            for (int f = 0; f < recordings.size(); f++) {
                if (recordings.get(f).getName().equals(id)) {
                    deleteDirectory(recordings.get(f));
                }
            }
        }
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

    private List<File> getDirectories(String path) {
        // Collection<File> files = FileUtils.listFilesAndDirs(new File(path),
        // new NotFileFilter(TrueFileFilter.INSTANCE),
        // DirectoryFileFilter.DIRECTORY);
        log.debug("getting directories for {}", path);
        List<File> files = new ArrayList<File>();
        try {
            DirectoryStream<Path> stream = Files.newDirectoryStream(FileSystems
                    .getDefault().getPath(path));
            Iterator<Path> iter = stream.iterator();
            while (iter.hasNext()) {
                Path next = iter.next();
                files.add(next.toFile());
            }
        } catch (IOException e) {
            e.printStackTrace();
        }
        return files;
    }

    private String[] getPlaybackFormats(String path) {
        List<File> dirs = getDirectories(path);
        String[] formats = new String[dirs.size()];

        for (int i = 0; i < dirs.size(); i++) {
            formats[i] = dirs.get(i).getName();
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
