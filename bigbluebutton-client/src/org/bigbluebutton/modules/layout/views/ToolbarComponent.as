/**
 * BigBlueButton open source conferencing system - http://www.bigbluebutton.org/
 * 
 * Copyright (c) 2017 BigBlueButton Inc. and by respective authors (see below).
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
package org.bigbluebutton.modules.layout.views {
	import com.asfusion.mate.events.Dispatcher;
	
	import flash.display.DisplayObject;
	import flash.display.DisplayObjectContainer;
	import flash.events.Event;
	
	import flexlib.mdi.containers.MDICanvas;
	
	import mx.containers.HBox;
	
	import org.bigbluebutton.common.IBbbToolbarComponent;
	import org.bigbluebutton.main.views.MainToolbar;
	import org.bigbluebutton.modules.layout.events.ViewInitializedEvent;
	import org.bigbluebutton.modules.layout.model.WindowLayout;
	
	public class ToolbarComponent extends HBox implements IBbbToolbarComponent {
		private var _dispatcher:Dispatcher = new Dispatcher();
		
		public var comboBox:LayoutsCombo;
		public var layoutButton:LayoutButton;
		
		public function ToolbarComponent() {
			super();
			
			comboBox = new LayoutsCombo();
			addChild(comboBox);
			layoutButton = new LayoutButton();
			addChild(layoutButton);
			
			addEventListener(Event.ADDED_TO_STAGE, onAddedToStage);
		}
		
		private function onAddedToStage(e:Event):void {
			removeEventListener(Event.ADDED_TO_STAGE, onAddedToStage);
			
			var evt:ViewInitializedEvent = new ViewInitializedEvent();
			evt.canvas = getMdiCanvas(parent) as MDICanvas;
			_dispatcher.dispatchEvent(evt);
		}
		
		public function set enableEdit(editable:Boolean):void {
			layoutButton.enableEditOptions(editable);
		}
		
		public function refreshRole(amIModerator:Boolean):void {
			comboBox.refreshRole(amIModerator);
			layoutButton.refreshRole(amIModerator);
		}
		
		public function visibleTools(arg:Boolean):void {
			visible = includeInLayout = arg;
		}
		
		private function getMdiCanvas(p:DisplayObjectContainer):DisplayObject {
			if (p == null)
				return null;
			
			for (var i:int = 0; i < p.numChildren; ++i) {
				//if (String(getQualifiedClassName(p.getChildAt(i))).match("MainCanvas"))
				if (WindowLayout.getType(p.getChildAt(i)) == "MainCanvas") 
					return p.getChildAt(i);
				
				var obj:DisplayObject = getMdiCanvas(p.parent);
				if (obj != null)
					return obj;
			}
			return null;
		}
		
		public function getAlignment():String{
			return MainToolbar.ALIGN_RIGHT;
		}
	}
}