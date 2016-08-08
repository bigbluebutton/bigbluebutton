package org.bigbluebutton.app.screenshare;


public class SharingStatus {

    public final Boolean sharingPaused;
    public final Boolean sharingStopped;

    public SharingStatus(Boolean sharingPaused, Boolean sharingStopped) {
        this.sharingPaused = sharingPaused;
        this.sharingStopped = sharingStopped;
    }
}
