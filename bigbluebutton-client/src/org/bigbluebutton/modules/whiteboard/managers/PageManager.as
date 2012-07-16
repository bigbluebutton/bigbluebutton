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
package org.bigbluebutton.modules.whiteboard.managers
{	
	import com.asfusion.mate.events.Dispatcher;
	
	import flash.events.TimerEvent;
	import flash.utils.Timer;
	
	import mx.collections.ArrayCollection;
	
	import org.bigbluebutton.modules.present.events.NavigationEvent;
	import org.bigbluebutton.modules.present.events.PresentationEvent;
	import org.bigbluebutton.modules.whiteboard.business.shapes.GraphicObject;
	import org.bigbluebutton.modules.whiteboard.business.shapes.WhiteboardConstants;
	import org.bigbluebutton.modules.whiteboard.events.PageEvent;
	import org.bigbluebutton.modules.whiteboard.events.WhiteboardUpdate;
	
	public class PageManager
	{
		private var pageNum:int;
		private var pages:ArrayCollection;	
		private var dispatcher:Dispatcher;

		public function PageManager() {
			pageNum = 0;
			pages = new ArrayCollection();
			dispatcher = new Dispatcher();
		}
		
<<<<<<< HEAD
		public function addShapeToPage(e:WhiteboardUpdate):void {
			(pages.getItemAt(pageNum) as ArrayCollection).addItem(e.data);
		}
		
		public function undoShapeFromPage():void {
			var page:ArrayCollection = pages.getItemAt(pageNum) as ArrayCollection;
=======
		public function addGraphicToPage(e:WhiteboardUpdate):void {
			var gobjToAdd:GraphicObject = e.data as GraphicObject;
			var currPage:Page = pages.getItemAt(pageNum) as Page;
			if(gobjToAdd.getGraphicType() == WhiteboardConstants.TYPE_TEXT) {
				if(checkIfModifiedText(currPage, gobjToAdd)) {
					currPage.modifyInPage(gobjToAdd);
				} else {
					currPage.addToPage(gobjToAdd);	
				}
				return;
			}
			currPage.addToPage(gobjToAdd);
		}
		
		public function checkIfModifiedText(pageToCheck:Page, gobj:GraphicObject):Boolean {
			if(pageToCheck.containsUniqueInPage(gobj.getGraphicID())) return true;
			return false;
		}
		
		public function undoGraphicFromPage():void {
			var page:Page = pages.getItemAt(pageNum) as Page;
>>>>>>> ajay/bbb-whiteboard-additions
			if (page.length > 0) page.removeItemAt(page.length - 1);
		}
		
		public function clearPage():void {
<<<<<<< HEAD
			var page:ArrayCollection = pages.getItemAt(pageNum) as ArrayCollection;
			page.removeAll();
		}
		
=======
			var page:Page = pages.getItemAt(pageNum) as Page;
			page.removeAll();
		}
		
		public function toggleGrid():void {
			var page:Page = pages.getItemAt(pageNum) as Page;
			page.toggleGrid();
		}
		
		public function isGridToggled():Boolean {
			var page:Page = pages.getItemAt(pageNum) as Page;
			return page.isGridToggled();
		}
		
>>>>>>> ajay/bbb-whiteboard-additions
		public function loadPage(e:PageEvent):void {
			if (pages.length ==0 ) return;
			if ((pages.getItemAt(e.pageNum) as Page).length == 0) return;
			
			var timer:Timer = new Timer(300, 1);
			timer.addEventListener(TimerEvent.TIMER, defferedLoad);
			timer.start();
		}
		
		private function defferedLoad(e:TimerEvent):void {
			gotoPage(this.pageNum);
		}
		
		public function changePage(e:NavigationEvent):void {
			gotoPage(e.pageNumber);
		}
		
		private function gotoPage(pageNumber:int):void {
			if (pages == null || pages.length < pageNumber) return;
			
			var event:PageEvent = new PageEvent(PageEvent.CHANGE_PAGE);
			event.pageNum = pageNumber;
			this.pageNum = pageNumber;
			event.graphicObjs = this.pages.getItemAt(pageNumber) as Page;
			event.isGrid = isGridToggled();
			dispatcher.dispatchEvent(event);
		}
		
		public function createPages(e:PresentationEvent):void {
			pages.removeAll();
			for (var i:int = 0; i<e.numberOfSlides; i++){
				pages.addItem(new Page());
			}
		}

	}
}