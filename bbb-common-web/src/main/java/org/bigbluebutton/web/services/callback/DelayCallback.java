package org.bigbluebutton.web.services.callback;

import java.util.concurrent.Delayed;
import java.util.concurrent.TimeUnit;

public class DelayCallback implements Delayed{
  public final ICallbackEvent callbackEvent;
  public final long callTime;
  public final int numAttempts;

  public DelayCallback(ICallbackEvent event, long delayInMillis, int numAttempts) {
    this.callbackEvent = event;
    this.callTime = System.currentTimeMillis() + delayInMillis;
    this.numAttempts = numAttempts;
  }

  @Override
  public long getDelay(TimeUnit unit) {
    long diff = callTime - System.currentTimeMillis();
    return unit.convert(diff, TimeUnit.MILLISECONDS);
  }

  @Override
  public int compareTo(Delayed o) {
    return new Long(this.callTime - ((DelayCallback) o).callTime).intValue();
  }
}
