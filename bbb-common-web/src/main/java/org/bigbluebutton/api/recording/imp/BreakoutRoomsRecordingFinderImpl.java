/**
 * BigBlueButton open source conferencing system - http://www.bigbluebutton.org/
 * 
 * Copyright (c) 2019 BigBlueButton Inc. and by respective authors (see below).
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
package org.bigbluebutton.api.recording.imp;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.concurrent.TimeUnit;

import org.bigbluebutton.api.recording.BreakoutRoomsRecrodingFinder;
import org.bigbluebutton.api.recording.handlers.BreakoutRoomsRecrodingHandler;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.zaxxer.nuprocess.NuProcess;
import com.zaxxer.nuprocess.NuProcessBuilder;

public class BreakoutRoomsRecordingFinderImpl implements BreakoutRoomsRecrodingFinder {
    private static Logger log = LoggerFactory.getLogger(BreakoutRoomsRecordingFinderImpl.class);

    private static int waitForSec = 30;
    private String convTimeout = "30s";

    public List<String> find(List<String> recordIDs, List<String> directories) {
        String findCommand = "grep -rlE --include metadata.xml \"parentMeetingId=\\\"(" + String.join("|", recordIDs)
                + ")\\\"\" " + String.join(" ", directories) + " | cut -d'/' -f 6-6  | sort | uniq";
        NuProcessBuilder finder = new NuProcessBuilder(
                Arrays.asList("timeout", convTimeout, "/bin/sh", "-c", findCommand));

        BreakoutRoomsRecrodingHandler pHandler = new BreakoutRoomsRecrodingHandler();
        finder.setProcessListener(pHandler);

        NuProcess process = finder.start();
        try {
            process.waitFor(waitForSec, TimeUnit.SECONDS);
        } catch (InterruptedException e) {
            log.error("InterruptedException while finding breakout rooms ids", e);
        }

        ArrayList<String> ids = pHandler.roomsIds();
        return ids;
    }
}
