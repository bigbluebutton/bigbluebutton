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
package org.bigbluebutton.modules.sharednotes.infrastructure
{
	public class Message
	{
		public var senderId:int;
		public var patchData:String;
		public var checksum:String;
		public var documentName:String;
		public var conType:String;
		
		public function Message(senderId:int, documentName:String, conType:String, patchData:String = "" , checksum:String = ""){
			this.senderId = senderId;
			this.documentName = documentName;
			this.patchData = patchData;
			this.checksum = checksum;
			this.conType = conType;
		}
		
		public static function deserialize(o:Object):Message {
			var patchData:String = "", checksum:String = "";
			
			if (o.checksum) checksum = o.checksum;
			if (o.patchData) patchData = o.patchData;
			
			return new Message(o.senderId, o.documentName, o.conType, patchData, checksum);
		}
		
		public function toString():String {
			return "Message: " + ", senderId " + senderId + ", patchData: " + patchData + ", checksum " + checksum
		}

	}
}