package org.bigbluebutton.api2.domain;


public class DurationProp2 {
    public final Integer duration;
    public final long createdTime;
    public final long startTime;
    public final long endTime;

    public DurationProp2(Integer duration,
                         long createdTime,
                         long startTime,
                         long endTime) {
        this.duration = duration;
        this.startTime = startTime;
        this.createdTime = createdTime;
        this.endTime = endTime;
    }
}
