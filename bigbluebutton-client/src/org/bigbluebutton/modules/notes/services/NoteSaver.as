/**
 * BigBlueButton open source conferencing system - http://www.bigbluebutton.org/
 * 
 * Copyright (c) 2012 BigBlueButton Inc. and by respective authors (see below).
 *
 * This program is free software; you can redistribute it and/or modify it under the
 * terms of the GNU Lesser General Public License as published by the Free Software
 * Foundation; either version 3.0 of the License, or (at your option) any later
 * version.
 * 
 * BigBlueButton is distributed in the hope that it will be useful, but WITHOUT ANY
 * WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A
 * PARTICULAR PURPOSE. See the GNU Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License along
 * with BigBlueButton; if not, see <http://www.gnu.org/licenses/>.
 *
 */
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
  
  import mx.utils.Base64Decoder;
  import mx.utils.Base64Encoder;
  
  import org.as3commons.logging.api.ILogger;
  import org.as3commons.logging.api.getClassLogger;
  import org.bigbluebutton.core.UsersUtil;
  import org.bigbluebutton.modules.notes.events.SaveErrorEvent;
  import org.bigbluebutton.modules.notes.events.SaveSuccessEvent;
  import org.bigbluebutton.modules.notes.models.Note;
  
  public class NoteSaver
  {
	private static const LOGGER:ILogger = getClassLogger(NoteSaver);      
    
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
      LOGGER.debug(" save");
      
      //_request.url = _serverURL + "/save";
      _request.url = _serverURL;
      _request.method = URLRequestMethod.GET;
      
      _vars = new URLVariables();
      _vars.saveNote = "";
      _vars.noteID = _note.noteID;
      _vars.text = base64Encode(_note.note);
      _vars.externalMeetingID = UsersUtil.getExternalMeetingID();
      _vars.internalMeetingID = UsersUtil.getInternalMeetingID();
      _vars.userID = UsersUtil.internalUserIDToExternalUserID(UsersUtil.getMyUserID());
      _vars.username = base64Encode(UsersUtil.getMyUsername());

      var dec:Base64Decoder = new Base64Decoder();
      dec.decode(_vars.text)
      var decNote:String = dec.toByteArray().toString();
      LOGGER.debug("Saving note [{0}][{1}] to [{2}]", [_vars.noteID, _vars.note, _request.url]);
      
      _request.data = _vars;
      
      try {
        _loader.load(_request);
      } catch (error:Error) {
        LOGGER.debug("Unable to load requested document.");
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
        LOGGER.debug("SAVED noteID [{0}] on [{1}]", [_note.noteID, xml.timestamp]);
        var successEvent:SaveSuccessEvent = new SaveSuccessEvent();
        successEvent.noteID = _note.noteID;
        successEvent.timestamp = xml.timestamp;
        _dispatcher.dispatchEvent(successEvent);        
      } else {
        LOGGER.debug("NOT SAVED");
      } 
    }
    
    private function saveSuccess(xml:XML):Boolean {
      if (xml.success == 'T' || xml.success == 't') return true;
      return false;
    }
    
    private function openHandler(event:Event):void {
		LOGGER.debug("openHandler: {0}", [event]);
    }
    
    private function progressHandler(event:ProgressEvent):void {
      LOGGER.debug("progressHandler loaded:{0} total: {1}", [event.bytesLoaded, event.bytesTotal]);
    }
    
    private function securityErrorHandler(event:SecurityErrorEvent):void {
      LOGGER.error("securityErrorHandler: {0}", [event]);
      var errorEvent:SaveErrorEvent = new SaveErrorEvent();
      errorEvent.reason = SaveErrorEvent.SECURITY_ERROR;
      errorEvent.noteID = _note.noteID;
      _dispatcher.dispatchEvent(errorEvent);
    }
    
    private function httpStatusHandler(event:HTTPStatusEvent):void {
      LOGGER.debug("httpStatusHandler: {0}", [event]);
    }
    
    private function ioErrorHandler(event:IOErrorEvent):void {
      LOGGER.error("ioErrorHandler: {0}", [event]);
      var errorEvent:SaveErrorEvent = new SaveErrorEvent();
      errorEvent.reason = SaveErrorEvent.IO_ERROR;
      errorEvent.noteID = _note.noteID;
      _dispatcher.dispatchEvent(errorEvent);
    }

  }
}