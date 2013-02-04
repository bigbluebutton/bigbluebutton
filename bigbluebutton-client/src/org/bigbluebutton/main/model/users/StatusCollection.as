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
package org.bigbluebutton.main.model.users
{
	import mx.collections.ArrayCollection;
	
	public class StatusCollection
	{			
		private var _status:ArrayCollection;	
					
		public function StatusCollection() {
			_status = new ArrayCollection();
		}
	
		public function set status(s:ArrayCollection):void {
			_status = s;
		}
		
		public function addStatus(status:Status):void {				
			if (! hasStatus(status.name)) {						
				_status.addItem(status);
			}					
		}
	
		public function hasStatus(name:String):Boolean {
			var index:int = getStatusIndex(name);
			
			if (index > -1) {
				return true;
			}						
			return false;		
		}
		
		public function changeStatus(status:Status):void {
			if (hasStatus(status.name)) {
				var s:Status = getStatus(status.name)						
				s = status;
			}	
		}
		
		public function getStatus(name:String):Status {
			var index:int = getStatusIndex(name);
			
			if (index > -1) {
				return _status.getItemAt(index) as Status;
			}
						
			return null;				
		}
			
		public function removeStatus(name:String):void {
			var index : int = getStatusIndex(name);

			if (index > -1) {
				_status.removeItemAt(index);
			}							
		}
			
		private function getStatusIndex(name:String):int {			
			for (var i:int=0;i<_status.length;i++) {
				var s:Status = _status.getItemAt(i) as Status;
				
				if (s.name == name) {
					return i;
				}
			}				
			
			// Stream not found.
			return -1;
		}
	
		public function removeAll():void {
			_status.removeAll();
		}		
		
		public function getAll():ArrayCollection {
			return _status;
		}			
	}
}