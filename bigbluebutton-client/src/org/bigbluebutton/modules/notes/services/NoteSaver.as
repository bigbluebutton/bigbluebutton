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
  import flash.utils.ByteArray;
  
  import mx.utils.Base64Decoder;
  import mx.utils.Base64Encoder;
  
  import org.bigbluebutton.core.UsersUtil;
  import org.bigbluebutton.modules.notes.events.SaveErrorEvent;
  import org.bigbluebutton.modules.notes.events.SaveSuccessEvent;
  import org.bigbluebutton.modules.notes.models.Note;
  import org.bigbluebutton.modules.notes.models.NotesOptions;
  
  public class NoteSaver
  {
    private var _serverURL:String;

    private var _request:URLRequest = new URLRequest();
    private var _vars:URLVariables;
    private var _uri:String;
    private var _loader:URLLoader = new URLLoader();
    private var _note:Note;
    private var _dispatcher:IEventDispatcher;
    
    public function NoteSaver(note:Note, serverURL:String, dispatcher:IEventDispatcher) {
      _note = note;
      _dispatcher = dispatcher;
      _serverURL = serverURL;
      
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
      _request.url = _serverURL;
      _request.method = URLRequestMethod.GET;
      
      _vars = new URLVariables();
      _vars.noteID = _note.noteID;
      _vars.note = base64Encode(_note.note);
      _vars.externalMeetingID = UsersUtil.getExternalMeetingID();
      _vars.internalMeetingID = UsersUtil.getInternalMeetingID();
      _vars.userId = UsersUtil.internalUserIDToExternalUserID(UsersUtil.getMyUserID());
      _vars.username = base64Encode(UsersUtil.getMyUsername());

      var dec:Base64Decoder = new Base64Decoder();
      dec.decode(_vars.note)
      var decNote:String = dec.toByteArray().toString();
      trace("Saving note [" + _vars.noteID + "][" + decNote + "] to [" + _request.url + "]");
      
      _request.data = _vars;
      
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
      var xml:XML = new XML(event.target.data);
      
      if (saveSuccess(xml)) {
        trace("SAVED");
        var successEvent:SaveSuccessEvent = new SaveSuccessEvent();
        successEvent.noteID = _note.noteID;
        _dispatcher.dispatchEvent(successEvent);        
      } else {
        trace("NOT SAVED");
      } 
    }
    
    private function saveSuccess(xml:XML):Boolean {
      if (xml.success == 'T' || xml.success == 't') return true;
      return false;
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

  }
}