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

package org.bigbluebutton.modules.present.model {
	import org.bigbluebutton.modules.present.ui.views.PresentationWindow;

	public class PresentationWindowManager {
		private var windows: Array = [];
		
		public function PresentationWindowManager() {
		}
		
		public function initCollection(numWindows:int):void {
			for (var i:int=0; i<numWindows; i++) {
				windows.push({windowId:"PresentationWindow"+i, podId: "", window: null});
			}
		}
		
		private function findEmptyWinId():Object {
			for (var i:int=1; i<windows.length; i++) {
				if (windows[i].window == null) {
					return windows[i];
				}
			}
			return null;
		}
		
		public function containsPodId(podId:String):Boolean {
			for (var i:int=0; i<windows.length; i++) {
				if (windows[i].podId == podId) {
					return true;
				}
			}
			return false;
		}
		
		public function findWindowByPodId(podId:String):PresentationWindow {
			for (var i:int=0; i<windows.length; i++) {
				if (windows[i].podId == podId) {
					return windows[i].window;
				}
			}
			return null;
		}
		
		public function findAllWindows():Array {
			var foundWindows:Array = [];
			for (var i:int=0; i<windows.length; i++) {
				if (windows[i].window != null) {
					foundWindows.push(windows[i].window);
				}
			}
			return foundWindows;
		}
		
		public function addWindow(podId:String, window:PresentationWindow, defaultWin:Boolean):String {
			var selectedWinId:Object;
			if (defaultWin) {
				selectedWinId = windows[0];
			} else {
				selectedWinId = findEmptyWinId();
			}
			
			if (selectedWinId != null) {
				selectedWinId.podId = podId;
				selectedWinId.window = window;
				return selectedWinId.windowId;
			}
			
			return null;
		}
		
		public function removeWindow(podId:String):void {
			for (var i:int=0; i<windows.length; i++) {
				if (windows[i].podId == podId) {
					windows[i].podId = "";
					windows[i].window = null;
				}
			}
		}
		
		public function isEmpty():Boolean {
			return windows.length == 0;
		}
	}
}