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
package org.bigbluebutton.modules.chat.views
{
  import flash.display.Sprite;
  import flash.events.Event;
  
  import mx.controls.List;
  import mx.controls.listClasses.IListItemRenderer;
  import mx.events.CollectionEvent;
  import mx.events.CollectionEventKind;
  
  import org.as3commons.logging.api.ILogger;
  import org.as3commons.logging.api.getClassLogger;
  
  public class AdvancedList extends List
  {
	private static const LOGGER:ILogger = getClassLogger(AdvancedList);      
	  
	override protected function drawHighlightIndicator(indicator:Sprite, x:Number, y:Number, width:Number, height:Number, color:uint, itemRenderer:IListItemRenderer):void {
		//intentionally empty to not show on hover
	}
	
    override protected function measure():void
    {
      super.measure();
      //sovled on forum by Flex HarUI
      measuredHeight = measureHeightOfItems() + viewMetrics.top + viewMetrics.bottom;

      //dispatchEvent(new ChatEvent(ChatEvent.RESIZE_CHAT_TOOLBAR));
    }
    
    public function scrollToBottom():void {
      // You have to use a loop because after you change the scroll position the scrollbar will reevaluate its size and the max value will likely change.
      var count:int = 0;
      while (count++ < 10){
        if (verticalScrollAtMax) break;
        
        //You shouldnt need to invalidate these anymore
        //invalidateSize();
        //invalidateDisplayList();
        //validateDisplayList();
        
        validateNow();
        //trace(LOG + "count: " + count + "\n\trequested index: " + index + "\n\t verticalScrollPosition: " + verticalScrollPosition + "\n\t listItems.length: " + listItems.length + "\n\t offscreenExtraRowsBottom: " + offscreenExtraRowsBottom + "\n\t maxVerticalScrollPosition: " + maxVerticalScrollPosition);
        
        // scrollToIndex doesn't actually work. It tries to be smarter than it is and determine whether it needs to show stuff, but it's too strict
        //trace(LOG + "scrollToIndex returned: " + scrollToIndex(maxVerticalScrollPosition));
        verticalScrollPosition = maxVerticalScrollPosition;
      }
    }
	
	public function get verticalScrollAtMax():Boolean {
		return verticalScrollPosition == maxVerticalScrollPosition;
	}
	
	override protected function collectionChangeHandler(event:Event):void {
		var previousVScroll:Number = verticalScrollPosition;
		
		super.collectionChangeHandler(event);
		
		if (event is CollectionEvent) {
			var cEvent:CollectionEvent = CollectionEvent(event);
			
			if (cEvent.kind == CollectionEventKind.REFRESH) {
				verticalScrollPosition = previousVScroll;
			}
		}
	}
  }
}