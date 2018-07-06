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
import java.io.IOException;
import java.nio.file.DirectoryStream;
import java.nio.file.FileSystems;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.Set;

import org.apache.commons.io.FileUtils;
import org.bigbluebutton.api.domain.Recording;
import org.bigbluebutton.api.domain.RecordingMetadata;
import org.bigbluebutton.api.messaging.messages.MakePresentationDownloadableMsg;
import org.bigbluebutton.api.util.RecordingMetadataReaderHelper;
import org.bigbluebutton.api2.domain.UploadedTrack;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class RecordingService {
    private static Logger log = LoggerFactory.getLogger(RecordingService.class);

    private String processDir = "/var/bigbluebutton/recording/process";
    private String publishedDir = "/var/bigbluebutton/published";
    private String unpublishedDir = "/var/bigbluebutton/unpublished";
    private String deletedDir = "/var/bigbluebutton/deleted";
    private RecordingMetadataReaderHelper recordingServiceHelper;
    private String recordStatusDir;
    private String captionsDir;
    private String presentationBaseDir;

    private void copyPresentationFile(File presFile, File dlownloadableFile) {
        try {
            FileUtils.copyFile(presFile, dlownloadableFile);
        } catch (IOException ex) {
            log.error("Failed to copy file: " + ex);
        }
    }

    public void processMakePresentationDownloadableMsg(MakePresentationDownloadableMsg msg) {
        File presDir = Util.getPresentationDir(presentationBaseDir, msg.meetingId, msg.presId);
        File downloadableFile = new File(presDir.getAbsolutePath() + File.separatorChar + msg.presFilename);

        if (presDir != null) {
            if (msg.downloadable) {
                File presFile = new File(presDir.getAbsolutePath() + File.separatorChar + msg.presId + ".pdf");
                copyPresentationFile(presFile, downloadableFile);
            } else {
                if (downloadableFile.exists()) {
                    if(downloadableFile.delete()) {
                        log.info("File deleted. {}", downloadableFile.getAbsolutePath());
                    } else {
                        log.warn("Failed to delete. {}", downloadableFile.getAbsolutePath());
                    }
                }
            }
        }
    }

    public File getDownloadablePresentationFile(String meetingId, String presId, String presFilename) {
        File presDir = Util.getPresentationDir(presentationBaseDir, meetingId, presId);
        File downloadableFile = new File(presDir.getAbsolutePath() + File.separatorChar + presFilename);
        return downloadableFile;
    }

    public void kickOffRecordingChapterBreak(String meetingId, Long timestamp) {
        String done = recordStatusDir + File.separatorChar + meetingId + "-" + timestamp + ".done";

        File doneFile = new File(done);
        if (!doneFile.exists()) {
            try {
                doneFile.createNewFile();
                if (!doneFile.exists())
                    log.error("Failed to create file.", done);
            } catch (IOException e) {
                log.error("Failed to create {} file", done);
            }
        } else {
            log.error("{} file already exists.", done);
        }
    }

    public void startIngestAndProcessing(String meetingId) {
        String done = recordStatusDir + File.separatorChar + meetingId + ".done";

        File doneFile = new File(done);
        if (!doneFile.exists()) {
            try {
                doneFile.createNewFile();
                if (!doneFile.exists())
                    log.error("Failed to create {} file.", done);
            } catch (IOException e) {
                log.error("Failed to create {} file.", done);
            }
        } else {
            log.error("{} file already exists.", done);
        }
    }

    public List<RecordingMetadata> getRecordingsMetadata(List<String> recordIDs, List<String> states) {
        List<RecordingMetadata> recs = new ArrayList<>();

        Map<String, List<File>> allDirectories = getAllDirectories(states);
        if (recordIDs.isEmpty()) {
            for (Map.Entry<String, List<File>> entry : allDirectories.entrySet()) {
                recordIDs.addAll(getAllRecordingIds(entry.getValue()));
            }
        }

        for (String recordID : recordIDs) {
            for (Map.Entry<String, List<File>> entry : allDirectories.entrySet()) {
                List<File> _recs = getRecordingsForPath(recordID, entry.getValue());
                for (File _rec : _recs) {
                    RecordingMetadata r = getRecordingMetadata(_rec);
                    if (r != null) {
                        recs.add(r);
                    }
                }
            }
        }

        return recs;
    }

    public String getRecordingTextTracks(String recordId) {
        return recordingServiceHelper.getRecordingTextTracks(recordId, captionsDir);
    }

    public String putRecordingTextTrack(UploadedTrack track) {
        return recordingServiceHelper.putRecordingTextTrack(track);
    }

    public String getRecordings2x(ArrayList<String> idList, ArrayList<String> states, Map<String, String> metadataFilters) {
        List<RecordingMetadata> recsList = getRecordingsMetadata(idList, states);
        ArrayList<RecordingMetadata> recs = filterRecordingsByMetadata(recsList, metadataFilters);
        return recordingServiceHelper.getRecordings2x(recs);
    }

    private RecordingMetadata getRecordingMetadata(File dir) {
        File file = new File(dir.getPath() + File.separatorChar + "metadata.xml");
        RecordingMetadata rec = recordingServiceHelper.getRecordingMetadata(file);
        return rec;
    }

    public boolean recordingMatchesMetadata(RecordingMetadata recording, Map<String, String> metadataFilters) {
        boolean matchesMetadata = true;
        Map<String, String> recMeta = recording.getMeta();
        for (Map.Entry<String, String> filter : metadataFilters.entrySet()) {
            String metadataValue = recMeta.get(filter.getKey());
            if ( metadataValue == null ) {
                // The recording doesn't have metadata specified
                matchesMetadata = false;
            } else {
                String filterValue = filter.getValue();
                if( filterValue.charAt(0) == '%' && filterValue.charAt(filterValue.length()-1) == '%' && metadataValue.contains(filterValue.substring(1, filterValue.length()-1)) ){
                    // Filter value embraced by two wild cards
                    // AND the filter value is part of the metadata value
                } else if( filterValue.charAt(0) == '%' && metadataValue.endsWith(filterValue.substring(1, filterValue.length())) ) {
                    // Filter value starts with a wild cards
                    // AND the filter value ends with the metadata value
                } else if( filterValue.charAt(filterValue.length()-1) == '%' && metadataValue.startsWith(filterValue.substring(0, filterValue.length()-1)) ) {
                    // Filter value ends with a wild cards
                    // AND the filter value starts with the metadata value
                } else if( metadataValue.equals(filterValue) ) {
                    // Filter value doesnt have wildcards
                    // AND the filter value is the same as metadata value
                } else {
                    matchesMetadata = false;
                }
            }
        }
        return matchesMetadata;
    }


    public ArrayList<RecordingMetadata> filterRecordingsByMetadata(List<RecordingMetadata> recordings, Map<String, String> metadataFilters) {
        ArrayList<RecordingMetadata> resultRecordings = new ArrayList<>();
        for (RecordingMetadata entry : recordings) {
            if (recordingMatchesMetadata(entry, metadataFilters))
                resultRecordings.add(entry);
        }
        return resultRecordings;
    }

    private ArrayList<File> getAllRecordingsFor(String recordId) {
        String[] format = getPlaybackFormats(publishedDir);
        ArrayList<File> ids = new ArrayList<File>();

        for (int i = 0; i < format.length; i++) {
            List<File> recordings = getDirectories(publishedDir + File.separatorChar + format[i]);
            for (int f = 0; f < recordings.size(); f++) {
                if (recordId.equals(recordings.get(f).getName()))
                    ids.add(recordings.get(f));
            }
        }

        return ids;
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
        List<String> ids = new ArrayList<>();

        for (String aFormat : format) {
            List<File> recordings = getDirectories(path + File.separatorChar + aFormat);
            for (File recording : recordings) {
                if (!ids.contains(recording.getName())) {
                    ids.add(recording.getName());
                }
            }
        }

        return ids;
    }

    private Set<String> getAllRecordingIds(List<File> recs) {
        Set<String> ids = new HashSet<>();

        Iterator<File> iterator = recs.iterator();
        while (iterator.hasNext()) {
            ids.add(iterator.next().getName());
        }

        return ids;
    }

    private List<File> getRecordingsForPath(String id, List<File> recordings) {
        List<File> recs = new ArrayList<>();

        Iterator<File> iterator = recordings.iterator();
        while (iterator.hasNext()) {
            File rec = iterator.next();
            if (rec.getName().startsWith(id)) {
              recs.add(rec);
            }
        }
        return recs;
    }

    private static void deleteRecording(String id, String path) {
        String[] format = getPlaybackFormats(path);
        for (String aFormat : format) {
            List<File> recordings = getDirectories(path + File.separatorChar + aFormat);
            for (File recording : recordings) {
                if (recording.getName().equals(id)) {
                    deleteDirectory(recording);
                    createDirectory(recording);
                }
            }
        }
    }

    private static void createDirectory(File directory) {
        if (!directory.exists())
            directory.mkdirs();
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

    private static List<File> getDirectories(String path) {
        List<File> files = new ArrayList<>();
        try {
            DirectoryStream<Path> stream = Files.newDirectoryStream(FileSystems.getDefault().getPath(path));
            Iterator<Path> iter = stream.iterator();
            while (iter.hasNext()) {
                Path next = iter.next();
                files.add(next.toFile());
            }
            stream.close();
        } catch (IOException e) {
            e.printStackTrace();
        }
        return files;
    }

    private static String[] getPlaybackFormats(String path) {
        System.out.println("Getting playback formats at " + path);
        List<File> dirs = getDirectories(path);
        String[] formats = new String[dirs.size()];

        for (int i = 0; i < dirs.size(); i++) {
            System.out.println("Playback format = " + dirs.get(i).getName());
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

    public void setPresentationBaseDir(String dir) {
        presentationBaseDir = dir;
    }

    public void setPublishedDir(String dir) {
        publishedDir = dir;
    }

    public void setCaptionsDir(String dir) {
        captionsDir = dir;
    }

    public void setRecordingServiceHelper(RecordingMetadataReaderHelper r) {
        recordingServiceHelper = r;
    }

    private boolean shouldIncludeState(List<String> states, String type) {
        boolean r = false;

        if (!states.isEmpty()) {
            if (states.contains("any")) {
                r = true;
            } else {
                if (type.equals(Recording.STATE_PUBLISHED) && states.contains(Recording.STATE_PUBLISHED)) {
                    r = true;
                } else if (type.equals(Recording.STATE_UNPUBLISHED) && states.contains(Recording.STATE_UNPUBLISHED)) {
                    r = true;
                } else if (type.equals(Recording.STATE_DELETED) && states.contains(Recording.STATE_DELETED)) {
                    r = true;
                } else if (type.equals(Recording.STATE_PROCESSING) && states.contains(Recording.STATE_PROCESSING)) {
                    r = true;
                } else if (type.equals(Recording.STATE_PROCESSED) && states.contains(Recording.STATE_PROCESSED)) {
                    r = true;
                }
            }

        } else {
            if (type.equals(Recording.STATE_PUBLISHED) || type.equals(Recording.STATE_UNPUBLISHED)) {
                r = true;
            }
        }

        return r;
    }

    public void changeState(String recordingId, String state) {
        if (state.equals(Recording.STATE_PUBLISHED)) {
            // It can only be published if it is unpublished
            changeState(unpublishedDir, recordingId, state);
        } else if (state.equals(Recording.STATE_UNPUBLISHED)) {
            // It can only be unpublished if it is published
            changeState(publishedDir, recordingId, state);
        } else if (state.equals(Recording.STATE_DELETED)) {
            // It can be deleted from any state
            changeState(publishedDir, recordingId, state);
            changeState(unpublishedDir, recordingId, state);
        }
    }

    private void changeState(String path, String recordingId, String state) {
        String[] format = getPlaybackFormats(path);
         for (String aFormat : format) {
            List<File> recordings = getDirectories(path + File.separatorChar + aFormat);
            for (File recording : recordings) {
                if (recording.getName().equalsIgnoreCase(recordingId)) {
                    File dest;
                    if (state.equals(Recording.STATE_PUBLISHED)) {
                       dest = new File(publishedDir + File.separatorChar + aFormat);
                       publishRecording(dest, recordingId, recording, aFormat);
                    } else if (state.equals(Recording.STATE_UNPUBLISHED)) {
                       dest = new File(unpublishedDir + File.separatorChar + aFormat);
                       unpublishRecording(dest, recordingId, recording, aFormat);
                    } else if (state.equals(Recording.STATE_DELETED)) {
                       dest = new File(deletedDir + File.separatorChar + aFormat);
                       deleteRecording(dest, recordingId, recording, aFormat);
                    } else {
                       log.debug(String.format("State: %s, is not supported", state));
                       return;
                    }
                }
            }
        }
    }

    public void publishRecording(File destDir, String recordingId, File recordingDir, String format) {
        File metadataXml = recordingServiceHelper.getMetadataXmlLocation(recordingDir.getPath());
        RecordingMetadata r = recordingServiceHelper.getRecordingMetadata(metadataXml);
        if (r != null) {
            if (!destDir.exists()) destDir.mkdirs();

            try {
                FileUtils.moveDirectory(recordingDir, new File(destDir.getPath() + File.separatorChar + recordingId));

                r.setState(Recording.STATE_PUBLISHED);
                r.setPublished(true);

                File medataXmlFile = recordingServiceHelper.getMetadataXmlLocation(
                  destDir.getAbsolutePath() + File.separatorChar + recordingId);

                // Process the changes by saving the recording into metadata.xml
                recordingServiceHelper.saveRecordingMetadata(medataXmlFile, r);
            } catch (IOException e) {
              log.error("Failed to publish recording : " + recordingId, e);
            }
        }
    }

    public void unpublishRecording(File destDir, String recordingId, File recordingDir, String format) {
        File metadataXml = recordingServiceHelper.getMetadataXmlLocation(recordingDir.getPath());

        RecordingMetadata r = recordingServiceHelper.getRecordingMetadata(metadataXml);
        if (r != null) {
            if (!destDir.exists()) destDir.mkdirs();

            try {
                FileUtils.moveDirectory(recordingDir, new File(destDir.getPath() + File.separatorChar + recordingId));
                r.setState(Recording.STATE_UNPUBLISHED);
                r.setPublished(false);

                File medataXmlFile = recordingServiceHelper.getMetadataXmlLocation(
                  destDir.getAbsolutePath() + File.separatorChar + recordingId);

                // Process the changes by saving the recording into metadata.xml
                recordingServiceHelper.saveRecordingMetadata(medataXmlFile, r);
            } catch (IOException e) {
              log.error("Failed to unpublish recording : " + recordingId, e);
            }
        }
    }

    public void deleteRecording(File destDir, String recordingId, File recordingDir, String format) {
        File metadataXml = recordingServiceHelper.getMetadataXmlLocation(recordingDir.getPath());

        RecordingMetadata r = recordingServiceHelper.getRecordingMetadata(metadataXml);
        if (r != null) {
            if (!destDir.exists()) destDir.mkdirs();

            try {
                FileUtils.moveDirectory(recordingDir, new File(destDir.getPath() + File.separatorChar + recordingId));
                r.setState(Recording.STATE_DELETED);
                r.setPublished(false);

                File medataXmlFile = recordingServiceHelper.getMetadataXmlLocation(
                  destDir.getAbsolutePath() + File.separatorChar + recordingId);

                // Process the changes by saving the recording into metadata.xml
                recordingServiceHelper.saveRecordingMetadata(medataXmlFile, r);
            } catch (IOException e) {
              log.error("Failed to delete recording : " + recordingId, e);
            }
        }
    }


    private List<File> getAllDirectories(String state) {
        List<File> allDirectories = new ArrayList<>();

        String dir = getDestinationBaseDirectoryName(state);

        if ( dir != null ) {
            String[] formats = getPlaybackFormats(dir);
            for (String format : formats) {
                allDirectories.addAll(getDirectories(dir + File.separatorChar + format));
            }
        }

        return allDirectories;
    }

    private Map<String, List<File>> getAllDirectories(List<String> states) {
        Map<String, List<File>> allDirectories = new HashMap<>();

        if ( shouldIncludeState(states, Recording.STATE_PUBLISHED) ) {
            List<File> listedDirectories = getAllDirectories(Recording.STATE_PUBLISHED);
            allDirectories.put(Recording.STATE_PUBLISHED, listedDirectories);
        }

        if ( shouldIncludeState(states, Recording.STATE_UNPUBLISHED) ) {
            List<File> listedDirectories = getAllDirectories(Recording.STATE_UNPUBLISHED);
            allDirectories.put(Recording.STATE_UNPUBLISHED, listedDirectories);
        }

        if ( shouldIncludeState(states, Recording.STATE_DELETED) ) {
            List<File> listedDirectories = getAllDirectories(Recording.STATE_DELETED);
            allDirectories.put(Recording.STATE_DELETED, listedDirectories);
        }

        if ( shouldIncludeState(states, Recording.STATE_PROCESSING) ) {
            List<File> listedDirectories = getAllDirectories(Recording.STATE_PROCESSING);
            allDirectories.put(Recording.STATE_PROCESSING, listedDirectories);
        }

        if ( shouldIncludeState(states, Recording.STATE_PROCESSED) ) {
            List<File> listedDirectories = getAllDirectories(Recording.STATE_PROCESSED);
            allDirectories.put(Recording.STATE_PROCESSED, listedDirectories);
        }

        return allDirectories;
    }

    public void updateMetaParams(List<String> recordIDs, Map<String,String> metaParams) {
        // Define the directories used to lookup the recording
        List<String> states = new ArrayList<>();
        states.add(Recording.STATE_PUBLISHED);
        states.add(Recording.STATE_UNPUBLISHED);
        states.add(Recording.STATE_DELETED);

        // Gather all the existent directories based on the states defined for the lookup
        Map<String, List<File>> allDirectories = getAllDirectories(states);

        // Retrieve the actual recording from the directories gathered for the lookup
        for (String recordID : recordIDs) {
            for (Map.Entry<String, List<File>> entry : allDirectories.entrySet()) {
                List<File> recs = getRecordingsForPath(recordID, entry.getValue());

                // Go through all recordings of all formats
                for (File rec : recs) {
                    File metadataXml = recordingServiceHelper.getMetadataXmlLocation(rec.getPath());
                    updateRecordingMetadata(metadataXml, metaParams, metadataXml);
                }
            }
        }

        return;
    }

    public void updateRecordingMetadata(File srxMetadataXml, Map<String,String> metaParams, File destMetadataXml) {
        RecordingMetadata rec = recordingServiceHelper.getRecordingMetadata(srxMetadataXml);

        Map<String, String> recMeta = rec.getMeta();

        if (rec != null && !recMeta.isEmpty()) {
            for (Map.Entry<String,String> meta : metaParams.entrySet()) {
                if ( !"".equals(meta.getValue()) ) {
                    // As it has a value, if the meta parameter exists update it, otherwise add it
                    recMeta.put(meta.getKey(), meta.getValue());
                } else {
                    // As it doesn't have a value, if it exists delete it
                    if ( recMeta.containsKey(meta.getKey()) ) {
                        recMeta.remove(meta.getKey());
                    }
                }
            }

            rec.setMeta(recMeta);

            // Process the changes by saving the recording into metadata.xml
            recordingServiceHelper.saveRecordingMetadata(destMetadataXml, rec);
        }
    }


    private Map<String,File> indexRecordings(List<File> recs) {
        Map<String,File> indexedRecs = new HashMap<>();

        Iterator<File> iterator = recs.iterator();
        while (iterator.hasNext()) {
            File rec = iterator.next();
            indexedRecs.put(rec.getName(), rec);
        }

        return indexedRecs;
    }

    private String getDestinationBaseDirectoryName(String state) {
        return getDestinationBaseDirectoryName(state, false);
    }

    private String getDestinationBaseDirectoryName(String state, boolean forceDefault) {
        String baseDir = null;

        if ( state.equals(Recording.STATE_PROCESSING) || state.equals(Recording.STATE_PROCESSED) )
            baseDir = processDir;
        else if ( state.equals(Recording.STATE_PUBLISHED) )
            baseDir = publishedDir;
        else if ( state.equals(Recording.STATE_UNPUBLISHED) )
            baseDir = unpublishedDir;
        else if ( state.equals(Recording.STATE_DELETED) )
            baseDir = deletedDir;
        else if ( forceDefault )
            baseDir = publishedDir;

        return baseDir;
    }

		public String getCaptionTrackInboxDir() {
			return captionsDir + File.separatorChar + "inbox";
		}
}
