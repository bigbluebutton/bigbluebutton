public class RecordingApp {

    public static void main(String[] args) {
        RecordingImportHandler handler = RecordingImportHandler.getInstance();
        handler.importRecordings("", true);
    }
}
