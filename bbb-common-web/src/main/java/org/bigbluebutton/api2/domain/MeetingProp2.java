package org.bigbluebutton.api2.domain;


public class MeetingProp2 {
    public final String name;
    public final String extId;
    public final String intId;
    public final String parentId;
    public final Integer sequence;
    public final Boolean isBreakout;

    public MeetingProp2(String name,
                        String extId,
                        String intId,
                        String parentId,
                        Integer sequence,
                        Boolean isBreakout) {
        this.name = name;
        this.extId = extId;
        this.intId = intId;
        this.parentId = parentId;
        this.sequence = sequence;
        this.isBreakout = isBreakout;
    }
}
