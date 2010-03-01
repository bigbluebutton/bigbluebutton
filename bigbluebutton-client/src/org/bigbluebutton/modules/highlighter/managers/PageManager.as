package org.bigbluebutton.modules.highlighter.managers
{	
	import com.asfusion.mate.events.Dispatcher;
	
	import mx.collections.ArrayCollection;
	import mx.controls.Alert;
	
	import org.bigbluebutton.modules.highlighter.events.HighlighterUpdate;
	import org.bigbluebutton.modules.highlighter.events.PageEvent;
	import org.bigbluebutton.modules.present.events.NavigationEvent;
	import org.bigbluebutton.modules.present.events.PresentationEvent;
	
	public class PageManager
	{
		private var pageNum:int;
		private var numberOfSlides:int;
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
			(pages.getItemAt(pageNum) as ArrayCollection).removeItemAt(pages.length - 1);
		}
		
		public function clearPage():void{
			var page:ArrayCollection = pages.getItemAt(pageNum) as ArrayCollection;
			page = new ArrayCollection();
		}
		
		public function changePage(e:NavigationEvent):void{
			var event:PageEvent = new PageEvent(PageEvent.CHANGE_PAGE);
			event.pageNum = e.pageNumber;
			this.pageNum = e.pageNumber;
			event.shapes = this.pages.getItemAt(this.pageNum) as ArrayCollection;
			dispatcher.dispatchEvent(event);
		}
		
		public function createPages(e:PresentationEvent):void{
			this.numberOfSlides = e.numberOfSlides;
			for (var i:int = 0; i<numberOfSlides; i++){
				pages.addItem(new ArrayCollection());
			}
		}

	}
}