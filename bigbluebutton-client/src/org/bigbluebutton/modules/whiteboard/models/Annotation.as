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
package org.bigbluebutton.modules.whiteboard.models
{
  public class Annotation {
    private var _id:String = "undefined";		
    private var _status:String = AnnotationStatus.DRAW_START;
    private var _type:String = "undefined";
    private var _userId:String = "undefined";
    private var _annotation:Object;

    public function Annotation(id:String, type:String, annotation:Object) {
      _id = id;
      _type = type;
      _annotation = annotation;
    }
    
    public function get type():String{
      return _type;
    }

    public function get id():String {
      return _id;
    }

    public function get annotation():Object {
      return _annotation;
    }

    public function set annotation(a:Object):void {
      _annotation = a;
    }

    public function get status():String {
      return _status;
    }

    public function set status(s:String):void {
      _status = s;
    }
	
    public function get userId():String {
      return _userId;
    }
	
    public function set userId(u:String):void {
      _userId = u;
    }
    
    public function get whiteboardId():String {
      return _annotation.whiteboardId;
    }
    
    public function get pageNumber():Number {
      return _annotation.pageNumber;
    }
	}
}