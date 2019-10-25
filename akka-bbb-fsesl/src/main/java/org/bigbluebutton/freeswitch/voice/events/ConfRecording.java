package org.bigbluebutton.freeswitch.voice.events;

public class ConfRecording {
    public final String recordingPath;
    public final Long recordingStartTime;

    public ConfRecording(String recordingPath, Long recordingStartTime) {
        this.recordingPath = recordingPath;
        this.recordingStartTime = recordingStartTime;
    }
}
