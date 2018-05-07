package org.bigbluebutton.main.model.modules
{
  import com.asfusion.mate.events.Dispatcher;
  
  import flash.events.Event;
  import flash.events.HTTPStatusEvent;
  import flash.events.IOErrorEvent;
  import flash.net.URLLoader;
  import flash.net.URLRequest;
  import flash.net.URLRequestMethod;
  import flash.net.URLVariables;
  import org.as3commons.logging.api.ILogger;
  import org.as3commons.logging.api.getClassLogger;
  import org.bigbluebutton.core.UsersUtil;
  import org.bigbluebutton.main.events.MeetingNotFoundEvent;
  
  public class EnterApiService
  {
	private static const LOGGER:ILogger = getClassLogger(EnterApiService);
    
    private var request:URLRequest = new URLRequest();
    private var vars:URLVariables = new URLVariables();
    
    private var urlLoader:URLLoader;
    private var _resultListener:Function;
    
    public function EnterApiService()
    {
      urlLoader = new URLLoader();
    }
    
    public function load(url:String):void {
      var date:Date = new Date();
      request = new URLRequest(url);
      request.method = URLRequestMethod.GET;		
      
      urlLoader.addEventListener(Event.COMPLETE, handleComplete);
      urlLoader.addEventListener(HTTPStatusEvent.HTTP_STATUS, httpStatusHandler);
      urlLoader.addEventListener(IOErrorEvent.IO_ERROR, ioErrorHandler);
      urlLoader.load(request);	
    }
    
    public function addResultListener(listener:Function):void {
      _resultListener = listener;
    }
    
    private function httpStatusHandler(event:HTTPStatusEvent):void {
      LOGGER.debug("httpStatusHandler: {0}", [event]);
    }
    
    private function ioErrorHandler(event:IOErrorEvent):void {
			var logData:Object = UsersUtil.initLogData();
			logData.uri = request.url;
			logData.logCode = "enter_api_io_error";
			LOGGER.info(JSON.stringify(logData));
      if (_resultListener != null) _resultListener(false, null);
    }
    
    private function handleComplete(e:Event):void {			
      var result:Object = JSON.parse(e.target.data);
      LOGGER.debug("Enter response = {0}", [JSON.stringify(result)]);
      
        var logData:Object = UsersUtil.initLogData();
        
      var returncode:String = result.response.returncode;
      if (returncode == 'FAILED') {
        logData.tags = ["initialization"];
				logData.uri = request.url;
				logData.logCode = "enter_api_call_failed";
        LOGGER.info(JSON.stringify(logData));

        var dispatcher:Dispatcher = new Dispatcher();
        dispatcher.dispatchEvent(new MeetingNotFoundEvent(result.response.logoutURL));			
      } else if (returncode == 'SUCCESS') {

          
        var response:Object = new Object();
        response.username = result.response.fullname;
        response.userId = result.response.internalUserID;
        response.meetingName = result.response.confname;
        response.meetingId = result.response.meetingID;
        
        logData.response = response;
        logData.tags = ["initialization"];
				logData.uri = request.url;
				logData.logCode = "enter_api_call_succeeded";
        LOGGER.info(JSON.stringify(logData));
         
        if (_resultListener != null) _resultListener(true, response);
      }
      
    }
    
    public function get loader():URLLoader{
      return this.urlLoader;
    }
  }
}