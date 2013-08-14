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
package org.bigbluebutton.modules.present.api
{
	import com.asfusion.mate.events.Dispatcher;
	
	import mx.containers.Canvas;
	import mx.controls.Button;
	
	import org.bigbluebutton.common.IBbbCanvas;
	import org.bigbluebutton.modules.present.events.AddOverlayCanvasEvent;

	public class PresentationAPI
	{
		private static var instance:PresentationAPI;
		
		private var dispatcher:Dispatcher;
		
		public function PresentationAPI(enforcer:SingletonEnforcer)
		{
			if (enforcer == null){
				throw new Error("There can only be 1 UserManager instance");
			}
			initialize();
		}
		
		private function initialize():void{
			dispatcher = new Dispatcher();
		}
		
		/**
		 * Return the single instance of the PresentationAPI class, which is a singleton
		 */
		public static function getInstance():PresentationAPI{
			if (instance == null){
				instance = new PresentationAPI(new SingletonEnforcer());
			}
			return instance;
		}
		
		public function addOverlayCanvas(canvas:IBbbCanvas):void{
			var overlayEvent:AddOverlayCanvasEvent = new AddOverlayCanvasEvent(AddOverlayCanvasEvent.ADD_OVERLAY_CANVAS);
			overlayEvent.canvas = canvas;
			dispatcher.dispatchEvent(overlayEvent);
		}
	}
}
class SingletonEnforcer{}