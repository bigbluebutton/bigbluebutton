package org.bigbluebutton.main.model.modules
{
  import com.asfusion.mate.events.Dispatcher;
  
  import flash.events.*;
  import flash.net.URLLoader;
  import flash.net.URLRequest;
  import flash.net.URLRequestMethod;
  import flash.net.URLVariables;
  import flash.net.navigateToURL;
  import mx.collections.ArrayCollection;	
  import org.bigbluebutton.common.LogUtil;
  import org.bigbluebutton.core.BBB;
  import org.bigbluebutton.core.model.Me;
  import org.bigbluebutton.core.model.MeBuilder;
  import org.bigbluebutton.core.model.MeetingBuilder;
  import org.bigbluebutton.core.model.MeetingModel;
  import org.bigbluebutton.core.model.StunOption;
  import org.bigbluebutton.core.model.users.User;
  import org.bigbluebutton.core.model.users.UsersModel;
  import org.bigbluebutton.main.events.MeetingNotFoundEvent;
  import org.bigbluebutton.main.model.users.events.ConnectionFailedEvent;
  
  public class EnterApiService
  {    
    private static const LOG:String = "Modules::EnterApiService - ";
    
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
      trace(LOG + "load " + url);
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
      LogUtil.debug(LOG + "httpStatusHandler: " + event);
    }
    
    private function ioErrorHandler(event:IOErrorEvent):void {
      trace(LOG + "ioErrorHandler: " + event);
      if (_resultListener != null) _resultListener(false, null);
    }
    
    private function handleComplete(e:Event):void {			
      var result:Object = JSON.parse(e.target.data);
      trace(LOG + "Enter response = " + JSON.stringify(result));
      
      var returncode:String = result.response.returncode;
      if (returncode == 'FAILED') {
        trace(LOG + "Enter API call FAILED = " + JSON.stringify(result));						
        var dispatcher:Dispatcher = new Dispatcher();
        dispatcher.dispatchEvent(new MeetingNotFoundEvent(result.response.logoutURL));			
      } else if (returncode == 'SUCCESS') {
        trace(LOG + "Enter API call SUCESS = " + JSON.stringify(result));
        var response:Object = new Object();
        response.username = result.response.fullname;
        response.userId = result.response.internalUserID;
        response.meetingName = result.response.confname;
        response.meetingId = result.response.meetingID;
         
        if (_resultListener != null) _resultListener(true, response);
      }
      
    }
    
    public function get loader():URLLoader{
      return this.urlLoader;
    }
  }
}