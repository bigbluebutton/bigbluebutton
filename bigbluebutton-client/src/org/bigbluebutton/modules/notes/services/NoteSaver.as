package org.bigbluebutton.modules.notes.services
{
  import com.asfusion.mate.events.Dispatcher;
  
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
  import org.bigbluebutton.modules.notes.events.SaveErrorEvent;
  import org.bigbluebutton.modules.notes.events.SaveSuccessEvent;
  import org.bigbluebutton.modules.notes.models.Note;
  import org.bigbluebutton.modules.notes.models.NotesOptions;
  
  public class NoteSaver
  {
    public var serverURL:String;
    public var dispatcher:Dispatcher;
    
    private var _request:URLRequest = new URLRequest();
    private var _vars:URLVariables;
    private var _uri:String;
    private var _loader = new URLLoader();
    private var _note:Note;
    private var _dispatcher:Dispatcher;
    
    public function NoteSaver(note:Note, dispatcher:Dispatcher) {
      _note = note;
      _dispatcher = dispatcher;
      
      _loader.addEventListener(Event.COMPLETE, completeHandler);
      _loader.addEventListener(Event.OPEN, openHandler);
      _loader.addEventListener(ProgressEvent.PROGRESS, progressHandler);
      _loader.addEventListener(SecurityErrorEvent.SECURITY_ERROR, securityErrorHandler);
      _loader.addEventListener(HTTPStatusEvent.HTTP_STATUS, httpStatusHandler);
      _loader.addEventListener(IOErrorEvent.IO_ERROR, ioErrorHandler);
    }
    
    public function getNoteID():String {
      return _note.noteID;
    }
    
    public function save():void {
      _request.url = serverURL;
      _request.method = URLRequestMethod.GET;
      
      var date:Date = new Date();
      
      _vars.noteID = generateRandomString(5) + "-" + date.time;           
      _vars.note = base64Encode(_note.note);
      _vars.eventName = UsersUtil.getExternalMeetingID();
      _vars.userId = UsersUtil.internalUserIDToExternalUserID(UsersUtil.getMyUserID());
      _vars.username = base64Encode(UsersUtil.getMyUsername());
           
      try {
        _loader.load(_request);
      } catch (error:Error) {
        trace("Unable to load requested document.");
        var errorEvent:SaveErrorEvent = new SaveErrorEvent();
        errorEvent.reason = SaveErrorEvent.FAILED_TO_SAVE;
        errorEvent.noteID = _note.noteID;
        _dispatcher.dispatchEvent(errorEvent);
      }
    }
    
    private function base64Encode(data:String):String {
      var encoder:Base64Encoder = new Base64Encoder();
      encoder.encode(data);
      return encoder.toString();
    }
    
    private function completeHandler(event:Event):void {
      var xml:XML = new XML(event.target.data)
      var successEvent:SaveSuccessEvent = new SaveSuccessEvent();
      successEvent.noteID = _note.noteID;
      _dispatcher.dispatchEvent(successEvent);
      
 //     var loader:URLLoader = URLLoader(event.target);
 //     trace("completeHandler: " + loader.data);
    }
    
    private function openHandler(event:Event):void {
      trace("openHandler: " + event);
    }
    
    private function progressHandler(event:ProgressEvent):void {
      trace("progressHandler loaded:" + event.bytesLoaded + " total: " + event.bytesTotal);
    }
    
    private function securityErrorHandler(event:SecurityErrorEvent):void {
      trace("securityErrorHandler: " + event);
      var errorEvent:SaveErrorEvent = new SaveErrorEvent();
      errorEvent.reason = SaveErrorEvent.SECURITY_ERROR;
      errorEvent.noteID = _note.noteID;
      _dispatcher.dispatchEvent(errorEvent);
    }
    
    private function httpStatusHandler(event:HTTPStatusEvent):void {
      trace("httpStatusHandler: " + event);
    }
    
    private function ioErrorHandler(event:IOErrorEvent):void {
      trace("ioErrorHandler: " + event);
      var errorEvent:SaveErrorEvent = new SaveErrorEvent();
      errorEvent.reason = SaveErrorEvent.IO_ERROR;
      errorEvent.noteID = _note.noteID;
      _dispatcher.dispatchEvent(errorEvent);
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