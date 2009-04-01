package org.bigbluebutton.modules.presentation.model.business
{
	import mx.collections.ArrayCollection;
	
	import org.bigbluebutton.modules.presentation.model.Slide;
	
	public class PresentationSlides implements IPresentationSlides
	{
		private var _slides:ArrayCollection = new ArrayCollection();
		private var _selected:int;
		
		public function PresentationSlides()
		{
		}

		public function get slides():ArrayCollection {
			return _slides;
		}
		
		public function get selected():int {
			return _selected;
		}
		
		public function set selected(num:int):void {
			_selected = num;
		}
		
		public function getSlideAt(num:int):Slide {
			return _slides.getItemAt(num) as Slide;
		}
		
		public function clear():void {
			_slides.removeAll();
		}
		
		public function add(slide:Slide):void {
			//LogUtil.debug('Adding slide ' + slide);
			_slides.addItem(slide);
		}
		
		public function size():int {
			return _slides.length;
		}
	}
}