package org.bigbluebutton.recording;

public class RecordingApp {

    public static void main(String[] args) {
        String path = "./metadata";
        boolean persist = false;

        if (args.length >= 1) {
            path = args[0];
        }

        if (args.length >= 2) {
            persist = Boolean.parseBoolean(args[1]);
        }

        RecordingImportHandler handler = RecordingImportHandler.getInstance();
        handler.importRecordings(path, persist);
    }
}
