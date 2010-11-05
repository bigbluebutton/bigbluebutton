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
package org.bigbluebutton.modules.listeners.business.vo
{
	import mx.collections.ArrayCollection;
	import org.bigbluebutton.common.LogUtil;
	
	public class Listeners
	{			
		[Bindable] public var listeners:ArrayCollection = null;				
				
		public function Listeners():void {
			listeners = new ArrayCollection();
		}

		public function addListener(listener:Listener):void {				
			if (! hasListener(listener.userid)) {						
				listeners.addItem(listener);
				sort();
			}					
		}

		public function hasListener(id:Number):Boolean {
			var l:Object = getListenerIndex(id);			
			if (l != null) {
				return true;
			}						
			return false;		
		}
			
		public function getListener(id:Number):Listener {
			var l:Object = getListenerIndex(id);			
			if (l != null) {
				return l.listener as Listener;
			}
						
			return null;				
		}
				
		public function removeListener(id:Number):void
		{
			var l:Object = getListenerIndex(id);					
			if (l != null) {
				LogUtil.info( "removing listener[" + l.listener.callerName + "," + l.listener.userid + "]")				
				l = listeners.removeItemAt(l.index);
				l = null;
				sort();
			}							
		}
			
		private function getListenerIndex(id:Number):Object
		{
			var l:Listener;			
			for (var i:int = 0; i < listeners.length; i++)
			{
				l = listeners.getItemAt(i) as Listener;				
				if (l.userid == id) {
					return {index:i, listener:l};
				}
			}				
			
			// Listener not found.
			return null;
		}
	
		public function removeAllListeners():void
		{
			listeners.removeAll();
		}		
	
		public function newUserStatus(id:Number, newStatus:String) : void
		{
			var l:Listener = getListener(id);
			
			if (l != null) {
				//l.status = newStatus;
			}	
			
			sort();		
		}
		
		private function sort() : void
		{
			listeners.source.sortOn("callerName", Array.CASEINSENSITIVE);	
			listeners.refresh();				
		}				
	}
}