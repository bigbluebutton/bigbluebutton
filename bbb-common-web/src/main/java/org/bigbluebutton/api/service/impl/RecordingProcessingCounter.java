/**
* BigBlueButton open source conferencing system - http://www.bigbluebutton.org/
*
* Copyright (c) 2026 BigBlueButton Inc. and by respective authors (see below).
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

package org.bigbluebutton.api.service.impl;

import java.util.Collections;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import org.bigbluebutton.api.domain.RecordingProcessingInfo;

/**
 * Counts recordings by where they are in the record-and-playback pipeline.
 * A recording counts once: as running if a step of it is running, else as
 * queued if work for it is waiting, else as failed if a step of it failed.
 * <p>
 * Names are those of status markers, Resque jobs and caption uploads. Each
 * starts with the record ID, which may be followed by a chapter break's
 * time, a format or an upload's time ({@code <record ID>-presentation}).
 */
public final class RecordingProcessingCounter {

    // A record ID: the SHA-1 of the meeting ID, then the meeting's start time in milliseconds.
    private static final Pattern RECORD_ID = Pattern.compile("^([0-9a-f]{40})-([0-9]{13})");

    private final Map<String, Long> queued = new HashMap<>();
    private final Map<String, Long> running = new HashMap<>();
    private final Set<String> failed = new HashSet<>();

    /** The record ID a name starts with, or the name itself if it starts with none. */
    static String recordId(String name) {
        Matcher m = RECORD_ID.matcher(name);
        return m.find() ? m.group() : name;
    }

    /**
     * Work for the recording is waiting, queued at queuedAt (milliseconds
     * since the epoch). When that is unknown, the recording's start time
     * stands in for it, being earlier than any work for the recording.
     */
    public void queued(String name, Long queuedAt) {
        String id = recordId(name);
        queued.merge(id, timeOr(queuedAt, id), Math::min);
    }

    /**
     * A step of the recording is running, started at startedAt
     * (milliseconds since the epoch). When that is unknown, the recording's
     * start time stands in for it, as for queued work.
     */
    public void running(String name, Long startedAt) {
        String id = recordId(name);
        running.merge(id, timeOr(startedAt, id), Math::min);
    }

    /** A step of the recording failed and hasn't been rebuilt or removed with bbb-record --delete since. */
    public void failed(String name) {
        failed.add(recordId(name));
    }

    public RecordingProcessingInfo result() {
        int queuedCount = 0;
        Long oldestQueuedTime = null;
        for (Map.Entry<String, Long> e : queued.entrySet()) {
            if (running.containsKey(e.getKey())) {
                continue;
            }
            queuedCount++;
            if (oldestQueuedTime == null || e.getValue() < oldestQueuedTime) {
                oldestQueuedTime = e.getValue();
            }
        }
        int failedCount = 0;
        for (String id : failed) {
            if (!running.containsKey(id) && !queued.containsKey(id)) {
                failedCount++;
            }
        }
        Long oldestRunningTime = running.isEmpty() ? null : Collections.min(running.values());
        return new RecordingProcessingInfo(queuedCount, running.size(), failedCount, oldestQueuedTime, oldestRunningTime);
    }

    private static long timeOr(Long time, String recordId) {
        return time != null ? time : startTime(recordId, System.currentTimeMillis());
    }

    private static long startTime(String recordId, long otherwise) {
        Matcher m = RECORD_ID.matcher(recordId);
        return m.find() ? Long.parseLong(m.group(2)) : otherwise;
    }
}
