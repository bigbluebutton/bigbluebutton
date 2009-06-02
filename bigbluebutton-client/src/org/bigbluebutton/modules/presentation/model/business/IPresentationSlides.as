package org.bigbluebutton.modules.presentation.model.business
{
	import mx.collections.ArrayCollection;
	
	import org.bigbluebutton.modules.presentation.model.Slide;
	
	public interface IPresentationSlides
	{
		function clear():void;
		function add(slide:Slide):void;
		function size():int;
		function get slides():ArrayCollection;
		function get selected():int;		
		function set selected(num:int):void;		
		function getSlideAt(num:int):Slide;
	}
}