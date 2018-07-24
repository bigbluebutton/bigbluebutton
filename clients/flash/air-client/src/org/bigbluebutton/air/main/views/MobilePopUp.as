package org.bigbluebutton.air.main.views {
	import flash.display.DisplayObjectContainer;
	import flash.events.Event;
	import flash.events.StageOrientationEvent;
	
	import mx.managers.PopUpManager;
	
	import spark.components.Group;
	import spark.components.Label;
	import spark.components.Scroller;
	import spark.components.SkinnablePopUpContainer;
	
	public class MobilePopUp extends SkinnablePopUpContainer {
		
		protected var _text:String;
		
		protected var _title:String;
		
		[SkinPart(required = "true")]
		public var chrome:Group;
		
		[SkinPart(required = "true")]
		public var titleDisplay:Label;
		
		[SkinPart(required = "false")]
		public var textDisplay:Label;
		
		[SkinPart(required = "false")]
		public var scroller:Scroller;
		
		[SkinPart(required = "false")]
		public var controlBarGroup:Group;
		
		public function set title(value:String):void {
			_title = value;
		}
		
		public function set text(value:String):void {
			_text = value;
		}
		
		public function MobilePopUp() {
			addEventListener(Event.ADDED_TO_STAGE, onAddedToStage, false, 0, true);
			addEventListener(Event.REMOVED_FROM_STAGE, removeFromStage, false, 0, true);
		}
		
		protected function onAddedToStage(event:Event):void {
			percentWidth = 80;
			stage.addEventListener(StageOrientationEvent.ORIENTATION_CHANGE, onOrientationChange, false, 0, true);
		}
		
		protected function removeFromStage(event:Event):void {
			stage.removeEventListener(StageOrientationEvent.ORIENTATION_CHANGE, onOrientationChange);
		}
		
		protected function onOrientationChange(event:Event):void {
			invalidateDisplayList();
		}
		
		protected override function updateDisplayList(unscaledWidth:Number, unscaledHeight:Number):void {
			super.updateDisplayList(unscaledWidth, unscaledHeight);
			PopUpManager.centerPopUp(this);
		}
		
		override protected function partAdded(partName:String, instance:Object):void {
			super.partAdded(partName, instance);
			
			if (instance == titleDisplay) {
				titleDisplay.text = _title;
			}
			if (instance == textDisplay) {
				textDisplay.text = _text;
			}
		}
		
		override protected function commitProperties():void {
			super.commitProperties();
			
			if (textDisplay) {
				textDisplay.text = _text;
			}
		}
		
		override public function open(owner:DisplayObjectContainer, modal:Boolean = false):void {
			super.open(owner, modal);
			PopUpManager.centerPopUp(this);
		}
	}
}
