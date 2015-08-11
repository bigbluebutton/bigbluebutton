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
  
  import mx.collections.ArrayCollection;
  import mx.utils.Base64Decoder;
  import mx.utils.Base64Encoder;
  
  import org.as3commons.logging.api.ILogger;
  import org.as3commons.logging.api.getClassLogger;
  import org.bigbluebutton.core.UsersUtil;
  import org.bigbluebutton.modules.notes.events.RetrieveNotesErrorEvent;
  import org.bigbluebutton.modules.notes.events.RetrieveNotesSuccessEvent;
  import org.bigbluebutton.modules.notes.models.Note;
  import org.bigbluebutton.modules.notes.models.NotesOptions;
  
  public class RetrieveNotesService
  {
	private static const LOGGER:ILogger = getClassLogger(RetrieveNotesService);      
    
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
      LOGGER.debug("retrieveNotes");
      
      //_request.url = _options.saveURL + "/notes";
      _request.url = _options.saveURL;
      _request.method = URLRequestMethod.GET;
      
      _vars = new URLVariables();
      _vars.retrieveNotes = "";
      _vars.meetingID = UsersUtil.getExternalMeetingID();
      _vars.userID = UsersUtil.internalUserIDToExternalUserID(UsersUtil.getMyUserID());
    
      try {
        _request.data = _vars;
        _loader.load(_request);
      } catch (error:Error) {
		LOGGER.debug("Unable to load requested document.");
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
		LOGGER.debug("Saving note [{0}][{1}]", [item.noteID, item.text]);
        var note:Note = new Note();
        var dec:Base64Decoder = new Base64Decoder();
        dec.decode(item.text)
        var decNote:String = dec.toByteArray().toString();
		LOGGER.debug("Saving note [{0}][{1}]", [item.noteID, decNote]);
        note.note = decNote;
        note.noteID =  item.noteID;
        note.saved = true;
        note.timestamp = item.timestamp;
        notes.addItem(note);
      }
      return notes;
    }
    
    private function getNotes(xml:XML):XMLList{
	  LOGGER.debug("*** [{0}]", [xml.toXMLString()]);
      return xml.notes.note;
    }
        
    private function openHandler(event:Event):void {
	  LOGGER.debug("openHandler: {0}", [event]);
    }
    
    private function progressHandler(event:ProgressEvent):void {
      LOGGER.debug("progressHandler loaded:{0} total: {1}" + [event.bytesLoaded, event.bytesTotal]);
    }
    
    private function securityErrorHandler(event:SecurityErrorEvent):void {
	  LOGGER.error("securityErrorHandler: {0}", [event]);
      var errorEvent:RetrieveNotesErrorEvent = new RetrieveNotesErrorEvent();
      _dispatcher.dispatchEvent(errorEvent);
    }
    
    private function httpStatusHandler(event:HTTPStatusEvent):void {
      LOGGER.debug("httpStatusHandler: {0}", [event]);
    }
    
    private function ioErrorHandler(event:IOErrorEvent):void {
	  LOGGER.error("ioErrorHandler: {0}", [event]);
      var errorEvent:RetrieveNotesErrorEvent = new RetrieveNotesErrorEvent();
      _dispatcher.dispatchEvent(errorEvent);
    }

  }
}