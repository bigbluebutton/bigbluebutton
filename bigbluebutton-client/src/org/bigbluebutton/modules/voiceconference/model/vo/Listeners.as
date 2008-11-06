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
package org.bigbluebutton.modules.voiceconference.model.vo
{
	import mx.collections.ArrayCollection;
	
	public class Listeners implements IListeners
	{			
		[Bindable] public var listeners:ArrayCollection = null;				
				
		public function Listeners():void
		{
			listeners = new ArrayCollection();
		}

		public function addListener(listener:Listener):void
		{				
			if (! hasListener(listener.userid)) {						
				listeners.addItem(listener);
				sort();
			}					
		}

		public function hasListener(id:Number):Boolean
		{
			var index:int = getListenerIndex(id);			
			if (index > -1) {
				return true;
			}						
			return false;		
		}
			
		public function getListener(id:Number):Listener
		{
			var index:int = getListenerIndex(id);			
			if (index > -1) {
				return listeners.getItemAt(index) as Listener;
			}
						
			return null;				
		}
				
		public function removeListener(id:Number):void
		{
			var index:int = getListenerIndex(id);		
			trace( "removing listener[" + id + " at index=" + index + "]")			
			if (index > -1) {
				trace( "remove listener[" + id + " at index=" + index + "]");				
				listeners.removeItemAt(index);
				sort();
			}							
		}
			
		private function getListenerIndex(id:Number):int
		{
			var l:Listener;			
			for (var i:int = 0; i < listeners.length; i++)
			{
				l = listeners.getItemAt(i) as Listener;				
				if (l.userid == id) {
					return i;
				}
			}				
			
			// Listener not found.
			return -1;
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
			listeners.source.sortOn("callerIdName", Array.CASEINSENSITIVE);	
			listeners.refresh();				
		}				
	}
}