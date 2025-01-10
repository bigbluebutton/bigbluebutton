package org.bigbluebutton.api2.domain;


public class MeetingProp2 {
    public final String name;
    public final String extId;
    public final String intId;
    public final int meetingCameraCap;
    public final int maxPinnedCameras;
    public final String cameraBridge;
    public final String screenShareBridge;
    public final String audioBridge;
    public final String parentId;
    public final Integer sequence;
    public final Boolean isBreakout;

    public MeetingProp2(String name,
                        String extId,
                        String intId,
                        int meetingCameraCap,
                        int maxPinnedCameras,
                        String cameraBridge,
                        String screenShareBridge,
                        String audioBridge,
                        String parentId,
                        Integer sequence,
                        Boolean isBreakout) {
        this.name = name;
        this.extId = extId;
        this.intId = intId;
        this.meetingCameraCap = meetingCameraCap;
        this.maxPinnedCameras = maxPinnedCameras;
        this.cameraBridge = cameraBridge;
        this.screenShareBridge = screenShareBridge;
        this.audioBridge = audioBridge;
        this.parentId = parentId;
        this.sequence = sequence;
        this.isBreakout = isBreakout;
    }
}
