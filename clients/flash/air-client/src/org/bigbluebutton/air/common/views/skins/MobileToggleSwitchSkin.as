package org.bigbluebutton.air.common.views.skins {
	import flash.events.Event;
	
	import mx.core.DPIClassification;
	import mx.core.IVisualElement;
	import mx.core.UIComponent;
	
	import spark.components.ToggleSwitch;
	import spark.core.SpriteVisualElement;
	import spark.skins.mobile.supportClasses.MobileSkin;
	
	import org.bigbluebutton.air.common.views.skins.assets.ToggleSwitchThumb;
	import org.bigbluebutton.air.common.views.skins.assets.ToggleSwitchTrack;
	
	/**
	 *  ActionScript-based skin for the ToggleSwitch control.
	 *  The colors of the component can
	 *  be customized using styles. This class is responsible for most of the
	 *  graphics drawing, with some additional fxg assets.
	 *
	 *  @langversion 3.0
	 *  @playerversion AIR 3
	 *  @productversion Flex 4.6
	 *
	 *  @see spark.components.ToggleSwitch
	 */
	public class MobileToggleSwitchSkin extends MobileSkin {
		//----------------------------------------------------------------------------------------------
		//
		//  Skin parts
		//
		//----------------------------------------------------------------------------------------------
		
		/**
		 *  The thumb skin part.
		 *
		 *  @langversion 3.0
		 *  @playerversion AIR 3
		 *  @productversion Flex 4.6
		 */
		public var thumb:IVisualElement;
		
		/**
		 *  The track skin part.
		 *
		 *  @langversion 3.0
		 *  @playerversion AIR 3
		 *  @productversion Flex 4.6
		 */
		public var track:IVisualElement;
		
		//----------------------------------
		//  hostComponent
		//----------------------------------
		
		private var _hostComponent:ToggleSwitch;
		
		/**
		 * @copy spark.skins.spark.ApplicationSkin#hostComponent
		 */
		public function get hostComponent():ToggleSwitch {
			return _hostComponent;
		}
		
		public function set hostComponent(value:ToggleSwitch):void {
			if (_hostComponent)
				_hostComponent.removeEventListener("thumbPositionChanged", thumbPositionChanged_handler);
			_hostComponent = value;
			if (_hostComponent)
				_hostComponent.addEventListener("thumbPositionChanged", thumbPositionChanged_handler);
		}
		
		/**
		 *  The contents inside the skin, not including the outline
		 *  stroke
		 */
		private var contents:UIComponent;
		
		private var switchTrackSkin:Class;
		
		private var switchThumbSkin:Class;
		
		protected var trackWidth:Number;
		
		protected var trackHeight:Number;
		
		protected var layoutThumbWidth:Number;
		
		protected var layoutThumbHeight:Number;
		
		public function MobileToggleSwitchSkin() {
			super();
			
			switchTrackSkin = ToggleSwitchTrack;
			switchThumbSkin = ToggleSwitchThumb;
			
			switch (applicationDPI) {
				case DPIClassification.DPI_640:  {
					layoutThumbWidth = 116;
					layoutThumbHeight = 116;
					trackWidth = 244;
					trackHeight = 108;
					break;
				}
				case DPIClassification.DPI_480:  {
					layoutThumbWidth = 87;
					layoutThumbHeight = 87;
					trackWidth = 183;
					trackHeight = 81;
					break;
				}
				case DPIClassification.DPI_320:  {
					layoutThumbWidth = 58;
					layoutThumbHeight = 58;
					trackWidth = 122;
					trackHeight = 54;
					break;
				}
				case DPIClassification.DPI_240:  {
					layoutThumbWidth = 38;
					layoutThumbHeight = 38;
					trackWidth = 81;
					trackHeight = 46;
					break;
				}
				case DPIClassification.DPI_120:  {
					layoutThumbWidth = 29;
					layoutThumbHeight = 29;
					trackWidth = 61;
					trackHeight = 27;
					break;
				}
				default:  {
					layoutThumbWidth = 21;
					layoutThumbHeight = 21;
					trackWidth = 41;
					trackHeight = 19;
					break;
				}
			}
		}
		
		override protected function createChildren():void {
			super.createChildren();
			contents = new UIComponent();
			addChild(contents);
			drawTrack();
			drawThumb();
		}
		
		override protected function measure():void {
			// The skin must be at least as large as the thumb
			measuredMinWidth = trackWidth;
			measuredMinHeight = trackHeight;
			
			measuredWidth = trackWidth;
			measuredHeight = trackHeight;
		}
		
		override protected function commitCurrentState():void {
			toggleSelectionState();
			layoutThumbs();
		}
		
		protected function drawTrack():void {
			track = new switchTrackSkin();
			track.width = trackWidth;
			track.height = trackHeight;
			contents.addChildAt(SpriteVisualElement(track), 0);
		}
		
		//Thumb ON the right side; Thumb OFF is on the left side
		protected function layoutThumbs():void {
			if (currentState.indexOf("AndSelected") != -1) {
				setElementPosition(thumb, trackWidth / 2, (trackHeight - thumb.height) / 2);
			} else {
				setElementPosition(thumb, 0, trackHeight / 2 - thumb.height / 2);
			}
		}
		
		//Depending on current state, update skinpart thumb accordingly
		protected function toggleSelectionState():void {
			if (currentState.indexOf("AndSelected") != -1) {
				track.alpha = 1;
			} else {
				track.alpha = 0.4;
			}
		}
		
		protected function drawThumb():void {
			thumb = new switchThumbSkin();
			thumb.width = layoutThumbWidth;
			thumb.height = layoutThumbHeight;
			contents.addChildAt(SpriteVisualElement(thumb), 1);
		}
		
		//Hostcomponent dispatches this event whenever the thumb position changes	
		protected function thumbPositionChanged_handler(event:Event):void {
			moveSlidingContent();
		}
		
		//Move the current thumb and label along with the animating content 
		protected function moveSlidingContent():void {
			if (!hostComponent)
				return;
			var x:Number = (track.getLayoutBoundsWidth() - thumb.getLayoutBoundsWidth()) * hostComponent.thumbPosition + track.getLayoutBoundsX();
			var y:Number = thumb.getLayoutBoundsY();
			setElementPosition(thumb, x, y);
		}
	}
}
