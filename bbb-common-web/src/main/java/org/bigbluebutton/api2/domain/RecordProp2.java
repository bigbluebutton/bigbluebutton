package org.bigbluebutton.api2.domain;


public class RecordProp2 {
    public final boolean record;
    public final boolean autoStartRecording;
    public final boolean allowStartStopRecording;

    public RecordProp2(boolean record,
                       boolean autoStartRecording,
                       boolean allowStartStopRecording) {
        this.record = record;
        this.autoStartRecording = autoStartRecording;
        this.allowStartStopRecording = allowStartStopRecording;
    }
}
