package org.bigbluebutton.freeswitch.voice.freeswitch.actions;

import java.util.concurrent.Delayed;
import java.util.concurrent.TimeUnit;

public class DelayedCommand implements Delayed {
  public final FreeswitchCommand conferenceCommand;
  public final long callTime;


  public DelayedCommand(FreeswitchCommand conferenceCommand, long delayInMillis) {
    this.conferenceCommand = conferenceCommand;
    this.callTime = System.currentTimeMillis() + delayInMillis;
  }

  @Override
  public long getDelay(TimeUnit unit) {
    long diff = callTime - System.currentTimeMillis();
    return unit.convert(diff, TimeUnit.MILLISECONDS);
  }

  @Override
  public int compareTo(Delayed o) {
    return new Long(this.callTime - ((DelayedCommand) o).callTime).intValue();
  }
}
