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
*59 Temple Place, Suite 330, Boston, MA 02111-1307 USA
* 
*/
package org.bigbluebutton.modules.presentation.controller.notifiers
{
	/**
	 * This is a convinience class so that multiple pieces of data can be sent through a pureMVC notification
	 * @author Denis Zgonjanin
	 * 
	 */	
	public class JoinNotifier
	{
		private var _userid:Number;
		private var _url:String;
		private var _room:String;
		
		/**
		 * Creates an object containing the following information 
		 * @param userid - the id of the user
		 * @param url - the url of the presentation
		 * @param room - the room in which the user is
		 * 
		 */		
		public function JoinNotifier(userid:Number, url:String, room:String)
		{
			this._userid = userid;
			this._url = url;
			this._room = room;
		}
		
		public function get userid():Number{
			return this._userid;
		}
		
		public function get url():String{
			return this._url;
		}
		
		public function get room():String{
			return this._room;
		}

	}
}