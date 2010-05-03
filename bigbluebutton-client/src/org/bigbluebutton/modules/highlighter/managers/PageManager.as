package org.bigbluebutton.modules.highlighter.managers
{	
	import com.asfusion.mate.events.Dispatcher;
	
	import flash.events.TimerEvent;
	import flash.utils.Timer;
	
	import mx.collections.ArrayCollection;
	
	import org.bigbluebutton.modules.highlighter.events.HighlighterUpdate;
	import org.bigbluebutton.modules.highlighter.events.PageEvent;
	import org.bigbluebutton.modules.present.events.NavigationEvent;
	import org.bigbluebutton.modules.present.events.PresentationEvent;
	
	public class PageManager
	{
		private var pageNum:int;
		private var pages:ArrayCollection;
		
		private var dispatcher:Dispatcher;
		
		public function PageManager()
		{
			pageNum = 0;
			pages = new ArrayCollection();
			dispatcher = new Dispatcher();
		}
		
		public function addShapeToPage(e:HighlighterUpdate):void{
			(pages.getItemAt(pageNum) as ArrayCollection).addItem(e.data);
		}
		
		public function undoShapeFromPage():void{
			var page:ArrayCollection = pages.getItemAt(pageNum) as ArrayCollection;
			if (page.length > 0) page.removeItemAt(page.length - 1);
		}
		
		public function clearPage():void{
			var page:ArrayCollection = pages.getItemAt(pageNum) as ArrayCollection;
			page.removeAll();
		}
		
		public function loadPage(e:PageEvent):void{
			if (pages.length ==0 ) return;
			if ((pages.getItemAt(e.pageNum) as ArrayCollection).length == 0) return;
			
			var timer:Timer = new Timer(300, 1);
			timer.addEventListener(TimerEvent.TIMER, defferedLoad);
			timer.start();
		}
		
		private function defferedLoad(e:TimerEvent):void{
			gotoPage(this.pageNum);
		}
		
		public function changePage(e:NavigationEvent):void{
			gotoPage(e.pageNumber);
		}
		
		private function gotoPage(pageNumber:int):void{
			var event:PageEvent = new PageEvent(PageEvent.CHANGE_PAGE);
			event.pageNum = pageNumber;
			this.pageNum = pageNumber;
			event.shapes = this.pages.getItemAt(pageNumber) as ArrayCollection;
			dispatcher.dispatchEvent(event);
		}
		
		public function createPages(e:PresentationEvent):void{
			pages.removeAll();
			for (var i:int = 0; i<e.numberOfSlides; i++){
				pages.addItem(new ArrayCollection());
			}
		}

	}
}