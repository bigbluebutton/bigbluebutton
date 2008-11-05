package org.bigbluebutton.modules.presentation.model.business
{
	import mx.collections.ArrayCollection;
	
	public interface IPresentationSlides
	{
		function clear():void;
		function add(slide:String):void;
		function size():int;
		function get slides():ArrayCollection;
		function get selected():int;		
		function set selected(num:int):void;		
		function getSlideAt(num:int):String;
	}
}