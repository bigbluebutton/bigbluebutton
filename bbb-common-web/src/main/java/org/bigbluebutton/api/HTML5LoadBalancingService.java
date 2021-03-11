/**
 * BigBlueButton open source conferencing system - http://www.bigbluebutton.org/
 * <p>
 * Copyright (c) 2020 BigBlueButton Inc. and by respective authors (see below).
 * <p>
 * This program is free software; you can redistribute it and/or modify it under the
 * terms of the GNU Lesser General Public License as published by the Free Software
 * Foundation; either version 3.0 of the License, or (at your option) any later
 * version.
 * <p>
 * BigBlueButton is distributed in the hope that it will be useful, but WITHOUT ANY
 * WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A
 * PARTICULAR PURPOSE. See the GNU Lesser General Public License for more details.
 * <p>
 * You should have received a copy of the GNU Lesser General Public License along
 * with BigBlueButton; if not, see <http://www.gnu.org/licenses/>.
 */

package org.bigbluebutton.api;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.BufferedReader;
import java.io.InputStreamReader;

import java.io.InputStream;
import java.io.OutputStream;

import org.apache.commons.io.IOUtils;

import java.util.ArrayList;
import java.util.List;

import org.bigbluebutton.api.util.HTML5ProcessLine;


public class HTML5LoadBalancingService {
    private static Logger log = LoggerFactory.getLogger(HTML5LoadBalancingService.class);
    private ArrayList<HTML5ProcessLine> list = new ArrayList<HTML5ProcessLine>();
    private final int MAX_NUMBER_OF_HTML5_INSTANCES = 20;
    private int lastSelectedInstanceId = 0;

    public void init() {
        log.info("HTML5LoadBalancingService initialised");
    }

    // Find nodejs processes associated with processing meeting events
    // $ ps -u meteor -o pcpu,cmd= | grep NODEJS_BACKEND_INSTANCE_ID
    // 1.1 /usr/share/node-v12.16.1-linux-x64/bin/node --max-old-space-size=2048 --max_semi_space_size=128 main.js NODEJS_BACKEND_INSTANCE_ID=1
    // 1.0 /usr/share/node-v12.16.1-linux-x64/bin/node --max-old-space-size=2048 --max_semi_space_size=128 main.js NODEJS_BACKEND_INSTANCE_ID=2
    public void scanHTML5processes() {
        try {
            this.list = new ArrayList<HTML5ProcessLine>();
            Process p1 = Runtime.getRuntime().exec(new String[]{"ps", "-u", "meteor", "-o", "pcpu,cmd="});
            InputStream input1 = p1.getInputStream();
            Process p2 = Runtime.getRuntime().exec(new String[]{"grep", HTML5ProcessLine.BBB_HTML5_PROCESS_IDENTIFIER});
            OutputStream output = p2.getOutputStream();
            IOUtils.copy(input1, output);
            output.close(); // signals grep to finish
            List<String> result = IOUtils.readLines(p2.getInputStream());
            for (String entry : result) {
                HTML5ProcessLine line = new HTML5ProcessLine(entry);
                list.add(line);
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    private boolean listItemWithIdExists(int id) {
        for (HTML5ProcessLine line : this.list) {
            if (line.instanceId == id) {
                return true;
            }
        }
        return false;
    }

    public int findSuitableHTML5ProcessByRoundRobin() {
        this.scanHTML5processes();
        if (list.isEmpty()) {
            log.warn("Did not find any instances of html5 process running");
            return 1;
        }

        for (int i = lastSelectedInstanceId + 1; i <= MAX_NUMBER_OF_HTML5_INSTANCES + lastSelectedInstanceId; i++) {
            int k = i % (MAX_NUMBER_OF_HTML5_INSTANCES + 1);
            if (this.listItemWithIdExists(k)) {
                this.lastSelectedInstanceId = k;
                return k;
            }
        }
        return 1;
    }

}
