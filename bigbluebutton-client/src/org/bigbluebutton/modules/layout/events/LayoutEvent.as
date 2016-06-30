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
package org.bigbluebutton.modules.layout.events
{
  import flash.events.Event;

  public class LayoutEvent extends Event
  {
    public static const SYNC_LAYOUT_EVENT:String = 'SYNC_LAYOUT_EVENT';
    public static const BROADCAST_LAYOUT_EVENT:String = 'BROADCAST_LAYOUT_EVENT';
    public static const LOCK_LAYOUT_EVENT:String = 'LOCK_LAYOUT_EVENT';
    public static const UNLOCK_LAYOUT_EVENT:String = 'UNLOCK_LAYOUT_EVENT';
    public static const STOP_LAYOUT_MODULE_EVENT:String = 'STOP_LAYOUT_MODULE_EVENT';
    public static const VIEW_INITIALIZED_EVENT:String = 'VIEW_INITIALIZED_EVENT';

    public static const SAVE_LAYOUTS_EVENT:String = 'SAVE_LAYOUTS_EVENT';
    public static const SAVE_LAYOUTS_WINDOW_EVENT:String = 'SAVE_LAYOUTS_WINDOW_EVENT';
    public static const LOAD_LAYOUTS_EVENT:String = 'LOAD_LAYOUTS_EVENT';
    public static const ADD_CURRENT_LAYOUT_EVENT:String = 'ADD_CURRENT_LAYOUT_EVENT';
    public static const FILE_LOADED_SUCCESSFULLY_EVENT:String = 'FILE_LOADED_SUCCESSFULLY_EVENT';
    public static const APPLY_DEFAULT_LAYOUT_EVENT:String = 'APPLY_DEFAULT_LAYOUT_EVENT';
    public static const INVALIDATE_LAYOUT_EVENT:String = 'INVALIDATE_LAYOUT_EVENT';

    public var layoutName:String = "";
    public var overwrite:Boolean = false;

    public function LayoutEvent(type:String, bubbles:Boolean=true, cancelable:Boolean=false)
    {
      super(type, bubbles, cancelable);
    }

  }
}
