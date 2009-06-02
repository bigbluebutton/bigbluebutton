/**
* BigBlueButton open source conferencing system - http://www.bigbluebutton.org/
*
* Copyright (c) 2008 by respective authors (see below).
*
* This program is free software; you can redistribute it and/or modify it under the
* terms of the GNU Lesser General Public License as published by the Free Software
* Foundation; either version 2.1 of the License, or (at your option) any later
* version.
*
* This program is distributed in the hope that it will be useful, but WITHOUT ANY
* WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A
* PARTICULAR PURPOSE. See the GNU Lesser General Public License for more details.
*
* You should have received a copy of the GNU Lesser General Public License along
* with this program; if not, write to the Free Software Foundation, Inc.,
* 59 Temple Place, Suite 330, Boston, MA 02111-1307 USA
* 
*/
package org.bigbluebutton.modules.video.model.vo
{
	public final class PlaybackState
	{
		public static const STOPPED : PlaybackState = new PlaybackState(0, "STOPPED");
		public static const PLAYING : PlaybackState = new PlaybackState(1, "PLAYING");
		public static const PAUSED : PlaybackState = new PlaybackState(2, "PAUSED");
		
		private var _value : int;
		private var _name : String;
		
		function PlaybackState(value : int, name : String)
		{
			_value = value;
			_name = name;
		}
		
		public function get name() : String
		{
			return _name;
		}
		
		public function get value() : int
		{
			return value;
		}
	}
}