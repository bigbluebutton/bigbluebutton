package org.bigbluebutton.modules.notes.services
{
  import flash.events.Event;
  import flash.events.HTTPStatusEvent;
  import flash.events.IEventDispatcher;
  import flash.events.IOErrorEvent;
  import flash.events.ProgressEvent;
  import flash.events.SecurityErrorEvent;
  import flash.net.URLLoader;
  import flash.net.URLRequest;
  import flash.net.URLRequestMethod;
  import flash.net.URLVariables;
  
  import mx.utils.Base64Encoder;
  
  import org.bigbluebutton.core.UsersUtil;
  import org.bigbluebutton.modules.notes.models.Note;
  import org.bigbluebutton.modules.notes.models.NotesOptions;

  public class NotesMessageService
  {
    // http://[ip address from config]/?note=[base64 encoded text]&eventName=[session name]&userId=[user id]&username=[base64 encoded username]
    // [Successful Save: T or F]##::##[time]##::##[base64 encoded note]##::##[eventName]##::##[userId]##::##[base64 encoded username]##::##[referrer ip address]
    
    private var _request:URLRequest = new URLRequest();
    private var _vars:URLVariables;
    
    private var _uri:String;
    private var _loader:URLLoader;
    private var _options:NotesOptions;
    
    public function NotesMessageService()
    {
      _loader = new URLLoader();
      configureListeners(_loader);
      

    }
    
    public function save(note:Note):void {
      _request.url = _options.saveURL;
      _request.method = URLRequestMethod.GET;
      var date:Date = new Date();
      _vars.noteID = generateRandomString(5) + "-" + date.time;           
      _vars.note = base64Encode(note.note);
      _vars.eventName = UsersUtil.getExternalMeetingID();
      _vars.userId = UsersUtil.internalUserIDToExternalUserID(UsersUtil.getMyUserID());
      _vars.username = base64Encode(UsersUtil.getMyUsername());
      
      try {
        _loader.load(_request);
      } catch (error:Error) {
        trace("Unable to load requested document.");
      }
    }
    
    private function base64Encode(data:String):String {
      var encoder:Base64Encoder = new Base64Encoder();
      encoder.encode(data);
      return encoder.toString();
    }
    
    private function configureListeners(dispatcher:IEventDispatcher):void {
      dispatcher.addEventListener(Event.COMPLETE, completeHandler);
      dispatcher.addEventListener(Event.OPEN, openHandler);
      dispatcher.addEventListener(ProgressEvent.PROGRESS, progressHandler);
      dispatcher.addEventListener(SecurityErrorEvent.SECURITY_ERROR, securityErrorHandler);
      dispatcher.addEventListener(HTTPStatusEvent.HTTP_STATUS, httpStatusHandler);
      dispatcher.addEventListener(IOErrorEvent.IO_ERROR, ioErrorHandler);
    }
    
    private function completeHandler(event:Event):void {
      var loader:URLLoader = URLLoader(event.target);
      trace("completeHandler: " + loader.data);
    }
    
    private function openHandler(event:Event):void {
      trace("openHandler: " + event);
    }
    
    private function progressHandler(event:ProgressEvent):void {
      trace("progressHandler loaded:" + event.bytesLoaded + " total: " + event.bytesTotal);
    }
    
    private function securityErrorHandler(event:SecurityErrorEvent):void {
      trace("securityErrorHandler: " + event);
    }
    
    private function httpStatusHandler(event:HTTPStatusEvent):void {
      trace("httpStatusHandler: " + event);
    }
    
    private function ioErrorHandler(event:IOErrorEvent):void {
      trace("ioErrorHandler: " + event);
    }
    
    private function generateRandomString(strlen:Number):String{
      var chars:String = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
      var num_chars:Number = chars.length - 1;
      var randomChar:String = "";
      
      for (var i:Number = 0; i < strlen; i++){
        randomChar += chars.charAt(Math.floor(Math.random() * num_chars));
      }
      return randomChar;
    }
    
  }
}