package org.bigbluebutton.main.api
{
  public class JSLog
  {
    public static const LOGGER:String = "BBBLOGGER";
    
    public static function debug(message:String):void
    {
      logger.debug(message);
    }
    
    public static function info(message:String):void
    {
      logger.info(message);
    }
    
    public static function error(message:String):void
    {
      logger.error(message);
    }
    
    public static function warn(message:String):void
    {
      logger.warn(message);
    }
        
    private static function get logger():JSLogger {
      return JSLogger.getInst();
    }
  }
}