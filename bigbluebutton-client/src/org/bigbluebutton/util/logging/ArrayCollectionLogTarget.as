/**
* BigBlueButton open source conferencing system - http://www.bigbluebutton.org/
*
* Copyright (c) 2010 BigBlueButton Inc. and by respective authors (see below).
*
* This program is free software; you can redistribute it and/or modify it under the
* terms of the GNU Lesser General Public License as published by the Free Software
* Foundation; either version 2.1 of the License, or (at your option) any later
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
package org.bigbluebutton.util.logging
{
	import mx.collections.ArrayCollection;
	import mx.core.mx_internal;
	import mx.logging.targets.LineFormattedTarget;
	
	use namespace mx_internal;
	
	public class ArrayCollectionLogTarget extends LineFormattedTarget
	{
		private var logMessages:ArrayCollection;
		
		public static const MAX_NUM_MESSAGES:int = 2000;
		
		public function ArrayCollectionLogTarget()
		{
			super();
			this.logMessages = new ArrayCollection();
		}
		
		override mx_internal function internalLog(message:String):void {
			if (logMessages.length >= MAX_NUM_MESSAGES) {
				logMessages.removeItemAt(0);
			} 
			logMessages.addItem(message + "\n");
		}
		
		public function clear():void {
			logMessages.removeAll();
		}
		
		public function get messages():String {
			var m:String = "";
			
			for (var i:int=0; i<logMessages.length; i++) {
				m += logMessages.getItemAt(i);			
			}
			
			return m;
		}
	}
}