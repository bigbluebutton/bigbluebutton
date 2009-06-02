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
	import flash.net.FileReference;
	
	/**
	 * This is a convinience class so that multiple pieces of data can be sent via a pureMVC notification 
	 * @author Denis Zgonjanin
	 * 
	 */	
	public class FileUploadNotifier
	{
		private var _fullURI:String;
		private var _room:String;
		private var _file:FileReference;
		
		/**
		 * Creates an object holding various important information 
		 * @param fullUri - The uri of the server where the files are to be uploaded
		 * @param room - The room on the conference server
		 * @param file - The FileReference object of the file we're trying to upload
		 * 
		 */		
		public function FileUploadNotifier(fullUri:String, room:String, file:FileReference)
		{
			this._file = file;
			this._fullURI = fullUri;
			this._room = room;
		}
		
		public function get file():FileReference{
			return this._file;
		}
		
		public function get room():String{
			return this._room;
		}
		
		public function get uri():String{
			return this._fullURI;
		}

	}
}