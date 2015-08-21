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
package org.bigbluebutton.modules.layout.model
{
	public class LayoutDefinitionFile {
		private var _layouts:Array = new Array();
		
		public function get list():Array {
			return _layouts;
		}
		
		public function pushXml(xml:XML):void {
			if (xml.@name == undefined)
				return;
				
			var layoutDefinition:LayoutDefinition = null;
			for each (var layout:LayoutDefinition in _layouts) {
				if (layout.name == xml.@name) {
					layoutDefinition = layout;
					break; 
				}
			}
			
			if (layoutDefinition == null) {
				layoutDefinition = new LayoutDefinition();
				layoutDefinition.load(xml);
				_layouts.push(layoutDefinition);
			} else {
				layoutDefinition.load(xml);
			}
		}
		
		public function push(layoutDefinition:LayoutDefinition):void {
			_layouts.push(layoutDefinition);
		}
		
		public function getDefault():LayoutDefinition {
			for each (var value:LayoutDefinition in _layouts) {
				if (value.defaultLayout)
					return value;
			}
			return null;
		}
		
		public function toXml():XML {
			var xml:XML = <layouts/>;
			for each (var layoutDefinition:LayoutDefinition in _layouts) {
				for each (var value:XML in layoutDefinition.toXml().children()) {
					xml.appendChild(value);
				}
			}
			return xml;
		}
    
    public function getLayout(name:String):LayoutDefinition {
      for each (var layout:LayoutDefinition in _layouts) {
        if (layout.name == name) {
          return layout; 
        }
      }      
      
      return null;
    }
	}
}