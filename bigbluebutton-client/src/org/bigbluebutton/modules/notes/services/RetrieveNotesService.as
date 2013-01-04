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
  import mx.collections.ArrayCollection;
  import mx.utils.Base64Decoder;
  import mx.utils.Base64Encoder; 
  import org.bigbluebutton.core.UsersUtil;
  import org.bigbluebutton.modules.notes.events.RetrieveNotesErrorEvent;
  import org.bigbluebutton.modules.notes.events.RetrieveNotesSuccessEvent;
  import org.bigbluebutton.modules.notes.events.SaveErrorEvent;
  import org.bigbluebutton.modules.notes.events.SaveSuccessEvent;
  import org.bigbluebutton.modules.notes.models.Note;
  import org.bigbluebutton.modules.notes.models.NotesOptions;
  
  public class RetrieveNotesService
  {
    private var _options:NotesOptions;
    private var _request:URLRequest = new URLRequest();
    private var _vars:URLVariables;
    private var _uri:String;
    private var _loader:URLLoader = new URLLoader();
    private var _dispatcher:IEventDispatcher;
    
    public function RetrieveNotesService(dispatcher:IEventDispatcher) {
      _dispatcher = dispatcher;
      _options = new NotesOptions();
      
      _loader.addEventListener(Event.COMPLETE, completeHandler);
      _loader.addEventListener(Event.OPEN, openHandler);
      _loader.addEventListener(ProgressEvent.PROGRESS, progressHandler);
      _loader.addEventListener(SecurityErrorEvent.SECURITY_ERROR, securityErrorHandler);
      _loader.addEventListener(HTTPStatusEvent.HTTP_STATUS, httpStatusHandler);
      _loader.addEventListener(IOErrorEvent.IO_ERROR, ioErrorHandler);
    }
       
    public function retrieveNotes():void {
      _request.url = _options.saveURL + "/notes";
      _request.method = URLRequestMethod.GET;
      
      _vars = new URLVariables();
      _vars.meetingID = UsersUtil.getExternalMeetingID();
      _vars.userId = UsersUtil.internalUserIDToExternalUserID(UsersUtil.getMyUserID());
    
      try {
        _loader.load(_request);
      } catch (error:Error) {
        trace("Unable to load requested document.");
        var errorEvent:RetrieveNotesErrorEvent = new RetrieveNotesErrorEvent();
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
      var notes:ArrayCollection = parseNotes(xml);
//      if (notes.length > 0) {
        var successEvent:RetrieveNotesSuccessEvent = new RetrieveNotesSuccessEvent();
        successEvent.notes = notes;
        _dispatcher.dispatchEvent(successEvent);        
//      }    
    }
    
    private function parseNotes(xml:XML):ArrayCollection {
      var notes:ArrayCollection = new ArrayCollection();
      var list:XMLList = getNotes(xml);
      var item:XML;
      for each(item in list){
        trace("Saving note [" + item.noteID + "][" + item.text + "]");
        var note:Note = new Note();
        var dec:Base64Decoder = new Base64Decoder();
        dec.decode(item.text)
        var decNote:String = dec.toByteArray().toString();
        trace("Saving note [" + item.noteID + "][" + decNote + "]");
        note.note = decNote;
        note.noteID =  item.noteID;
        note.saved = true;
        notes.addItem(note);
      }
      return notes;
    }
    
    private function getNotes(xml:XML):XMLList{
      trace("*** [" + xml.toXMLString() + "]");
      return xml.note;
    }
        
    private function openHandler(event:Event):void {
      trace("openHandler: " + event);
    }
    
    private function progressHandler(event:ProgressEvent):void {
      trace("progressHandler loaded:" + event.bytesLoaded + " total: " + event.bytesTotal);
    }
    
    private function securityErrorHandler(event:SecurityErrorEvent):void {
      trace("securityErrorHandler: " + event);
      var errorEvent:RetrieveNotesErrorEvent = new RetrieveNotesErrorEvent();
      _dispatcher.dispatchEvent(errorEvent);
    }
    
    private function httpStatusHandler(event:HTTPStatusEvent):void {
      trace("httpStatusHandler: " + event);
    }
    
    private function ioErrorHandler(event:IOErrorEvent):void {
      trace("ioErrorHandler: " + event);
      var errorEvent:RetrieveNotesErrorEvent = new RetrieveNotesErrorEvent();
      _dispatcher.dispatchEvent(errorEvent);
    }
    

  }
}