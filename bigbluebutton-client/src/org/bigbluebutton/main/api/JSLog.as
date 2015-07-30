package org.bigbluebutton.main.api
{
  public class JSLog
  {
    public static const LOGGER:String = "BBBLOGGER";
    
    public static function debug(message:String, data: Object):void
    {
      logger.debug(message, data);
    }
    
    public static function info(message:String, data: Object):void
    {
      logger.info(message, data);
    }
    
    public static function error(message:String, data: Object):void
    {
      logger.error(message, data);
    }
    
    public static function warn(message:String, data: Object):void
    {
      logger.warn(message, data);
    }

    public static function critical(message:String, data: Object):void
    {
      logger.critical(message, data);
    }
        
    private static function get logger():JSLogger {
      return JSLogger.getInst();
    }
  }
}