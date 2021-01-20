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

package org.bigbluebutton.api.util;

public class HTML5ProcessLine {

    public int instanceId;
    public double percentageCPU;

    public HTML5ProcessLine(String input) {
        // System.out.println("input:" + input);
        //  0.1 /usr/share/node-v12.16.1-linux-x64/bin/node main.js INFO_INSTANCE_ID=3

        String[] a = input.trim().split(" ");
        this.percentageCPU = Double.parseDouble(a[0]);
        String instanceIdInfo = a[3];
        this.instanceId = Integer.parseInt(instanceIdInfo.replace("INFO_INSTANCE_ID=", ""));
    }

    public String toString() {
        return "instanceId:" + this.instanceId + " CPU:" + this.percentageCPU;
    }


}
