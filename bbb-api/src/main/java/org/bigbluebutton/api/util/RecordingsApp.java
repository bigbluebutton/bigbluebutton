package org.bigbluebutton.api.util;

public class RecordingsApp {

    public static void main(String[] args) {
        RecordingHandler recordingHandler = RecordingHandler.getInstance();
        recordingHandler.importRecordings();
    }
}
