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
package org.bigbluebutton.modules.viewers.model.vo
{
	import org.bigbluebutton.common.Role;
	
	/**
	 * The User class holds the properties of the client user
	 * @author
	 * 
	 */	
	[Bindable]
	public class User
	{
		public var userid : Number;
		public var name : String;
		public var status : String = "lowerhand";
		public var role : String = Role.VIEWER;	
		
		/**
		 * If the user is broadcasting a stream (video and/or audio)
		 */ 	
		public var hasStream : Boolean = false;
		
		/**
		 * The name of the stream the user id broadcasting
		 */
		public var streamName : String = null;
	}
}