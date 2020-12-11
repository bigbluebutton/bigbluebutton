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

    public void init() {
        log.info("HTML5LoadBalancingService initialised");
    }

    public void scanHTML5processes() {
        try {
            this.list = new ArrayList<HTML5ProcessLine>();
            Process p1 = Runtime.getRuntime().exec(new String[]{"ps", "-u", "meteor", "-o", "pcpu,cmd="});
            InputStream input1 = p1.getInputStream();
            Process p2 = Runtime.getRuntime().exec(new String[]{"grep", "node-"});
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

    public int findSuitableHTML5Process() {
        this.scanHTML5processes();
        if (list.isEmpty()) {
            log.warn("Did not find any instances of html5 process running");
            return 1;
        }
        double smallestCPUvalue = this.list.get(0).percentageCPU;
        int instanceIDofSmallestCPUValue = this.list.get(0).instanceId;
        for (HTML5ProcessLine line : this.list) {
            System.out.println(line.toString());
            if (smallestCPUvalue > line.percentageCPU) {
                smallestCPUvalue = line.percentageCPU;
                instanceIDofSmallestCPUValue = line.instanceId;
            }
        }
        return instanceIDofSmallestCPUValue;
    }

}
