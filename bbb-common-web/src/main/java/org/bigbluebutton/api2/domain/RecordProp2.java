package org.bigbluebutton.api2.domain;


public class RecordProp2 {
    public final boolean record;
    public final boolean autoStartRecording;
    public final boolean allowStartStopRecording;
    public final boolean recordFullDurationMedia;

    public RecordProp2(boolean record,
                       boolean autoStartRecording,
                       boolean allowStartStopRecording,
                       boolean recordFullDurationMedia
                       ) {
        this.record = record;
        this.autoStartRecording = autoStartRecording;
        this.allowStartStopRecording = allowStartStopRecording;
        this.recordFullDurationMedia = recordFullDurationMedia;
    }
}
