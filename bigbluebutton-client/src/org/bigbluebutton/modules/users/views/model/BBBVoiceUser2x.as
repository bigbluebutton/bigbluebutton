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
package org.bigbluebutton.modules.users.views.model
{
  import com.asfusion.mate.events.Dispatcher;
  
  import org.as3commons.logging.api.ILogger;
  import org.as3commons.logging.api.getClassLogger;
  
  public class BBBVoiceUser2x {
    private static const LOGGER:ILogger = getClassLogger(BBBVoiceUser2x);
    
    public var dispatcher:Dispatcher = new Dispatcher();
    
    [Bindable] public var userId:String = "UNKNOWN USER";
    [Bindable] public var name:String = "";  
    [Bindable] public var callingWith: String = "";
    [Bindable] public var talking: Boolean = false;
    [Bindable] public var listenOnly: Boolean = false;
        
    private var _muted:Boolean = false;
    [Bindable]
    public function get muted():Boolean {
      return _muted;
    }
    public function set muted(v:Boolean):void {
      _muted = v;
    }
  }
}
