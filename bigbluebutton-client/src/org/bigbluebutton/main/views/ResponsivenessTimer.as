package org.bigbluebutton.main.views
{
  import flash.events.TimerEvent;
  import flash.utils.Timer;
  
  import org.as3commons.logging.api.ILogger;
  import org.as3commons.logging.api.getClassLogger;
  import org.bigbluebutton.core.UsersUtil;
  
  public class ResponsivenessTimer
  {
    private static const LOGGER:ILogger = getClassLogger(ResponsivenessTimer);
    
    private var respTimer:Timer
    private var lastTimerFire:Date = new Date();
    
    /**
    * Checks for client responsiveness. The idea is that the
    * timer fires every 10 seconds. If last timer fired more than
    * 60 secs ago, then we assume that the client became unresponsive 
    * and log it.
     */
    public function ResponsivenessTimer()
    {
      respTimer = new Timer(10000, 0);
      respTimer.addEventListener(TimerEvent.TIMER, timerHandler);
      
    }
    
    public function start():void {
      respTimer.start();
    }
    
    public function stop():void {
      respTimer.stop();
    }
    
    public function timerHandler(event:TimerEvent):void {
      var now:Date = new Date();
      var timeDiff: Number = now.time - lastTimerFire.time
      if (timeDiff > 60000) {
        var logData:Object = UsersUtil.initLogData();
        logData.tags = ["responsiveness"];
        logData.freezeSec = timeDiff / 1000; 
        logData.logCode = "flash_client_unresponsive";
        LOGGER.info(JSON.stringify(logData));
      }
      
      lastTimerFire = now;
    }
  }
}