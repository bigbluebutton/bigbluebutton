/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */

package org.bigbluebutton.playback

/**
 *
 * @author Usuario
 */
class Conference {
    String meetingToken;
    String meetingName;
    String date;

    public Conference() {
    }

    public Conference(String meetingToken, String meetingName, String date) {
        this.meetingToken = meetingToken;
        this.meetingName = meetingName;
        this.date = date;
    }
}

