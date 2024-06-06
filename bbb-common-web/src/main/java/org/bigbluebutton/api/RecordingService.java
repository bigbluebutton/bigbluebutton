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

import org.bigbluebutton.api.messaging.messages.MakePresentationDownloadableMsg;
import org.bigbluebutton.api.model.entity.Recording;
import org.bigbluebutton.api2.domain.UploadedTrack;

import java.io.File;
import java.util.List;
import java.util.Map;

import org.springframework.data.domain.*;

public interface RecordingService {

    Boolean validateTextTrackSingleUseToken(String recordId, String caption, String token);
    String getRecordingTextTracks(String recordId);
    String putRecordingTextTrack(UploadedTrack track);
    String getCaptionTrackInboxDir();
    String getCaptionsDir();
    boolean isRecordingExist(String recordId);
    String getRecordings2x(List<String> idList, List<String> states, Map<String, String> metadataFilters, int offset, Pageable pageable);
    boolean existAnyRecording(List<String> idList);
    boolean changeState(String recordingId, String state);
    void updateMetaParams(List<String> recordIDs, Map<String,String> metaParams);
    void startIngestAndProcessing(String meetingId);
    void markAsEnded(String meetingId);
    void kickOffRecordingChapterBreak(String meetingId, Long timestamp);
    void processMakePresentationDownloadableMsg(MakePresentationDownloadableMsg msg);
    File getDownloadablePresentationFile(String meetingId, String presId, String presFilename);

    // Construct page using offset and limit parameters
    default <T> Page<T> listToPage(List<T> list, int offset, Pageable pageable) {
        int end = (int) (Math.min((offset + pageable.getPageSize()), list.size()));
        return new PageImpl<>(list.subList(offset, end), pageable, list.size());
    }
}