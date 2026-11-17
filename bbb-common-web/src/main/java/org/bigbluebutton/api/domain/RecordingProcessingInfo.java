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

package org.bigbluebutton.api.domain;

/**
 * Where this server's recordings are in the record-and-playback pipeline,
 * as getRecordingProcessingInfo reports it. Each count is of recordings,
 * not jobs. oldestQueuedTime is when the oldest queued work was queued, and
 * oldestRunningTime when the oldest running step started, in milliseconds
 * since the epoch; each is null when nothing is queued, or running.
 */
public record RecordingProcessingInfo(int queuedCount, int runningCount, int failedCount,
        Long oldestQueuedTime, Long oldestRunningTime) {

    /** Whether work is still queued or running. Failed recordings don't count: they never finish on their own. */
    public boolean processing() {
        return queuedCount > 0 || runningCount > 0;
    }
}
