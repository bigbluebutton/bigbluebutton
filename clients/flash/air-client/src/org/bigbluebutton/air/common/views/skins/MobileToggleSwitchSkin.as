////////////////////////////////////////////////////////////////////////////////
//
//  Licensed to the Apache Software Foundation (ASF) under one or more
//  contributor license agreements.  See the NOTICE file distributed with
//  this work for additional information regarding copyright ownership.
//  The ASF licenses this file to You under the Apache License, Version 2.0
//  (the "License"); you may not use this file except in compliance with
//  the License.  You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
//  Unless required by applicable law or agreed to in writing, software
//  distributed under the License is distributed on an "AS IS" BASIS,
//  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
//  See the License for the specific language governing permissions and
//  limitations under the License.
//
////////////////////////////////////////////////////////////////////////////////

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
		
		public var selectedLabelDisplay:LabelDisplayComponent;
		
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
		
		//----------------------------------
		//  selectedLabel
		//----------------------------------
		
		private var _selectedLabel:String;
		
		/**
		 *  The text of the label showing when the component is selected.
		 *  Subclasses can set or override this property to customize the selected label.
		 *
		 *  @langversion 3.0
		 *  @playerversion AIR 3
		 *  @productversion Flex 4.6
		 */
		protected function get selectedLabel():String {
			return _selectedLabel;
		}
		
		protected function set selectedLabel(value:String):void {
			_selectedLabel = value;
		}
		
		//----------------------------------
		//  unselectedLabel
		//----------------------------------
		
		private var _unselectedLabel:String;
		
		/**
		 *  The text of the label showing when the component is not selected.
		 *  Subclasses can set or override this property to customize the unselected label.
		 *
		 *  @langversion 3.0
		 *  @playerversion AIR 3
		 *  @productversion Flex 4.6
		 */
		protected function get unselectedLabel():String {
			return _unselectedLabel;
		}
		
		protected function set unselectedLabel(value:String):void {
			_unselectedLabel = value;
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
			
			selectedLabel = resourceManager.getString("components", "toggleSwitchSelectedLabel");
			unselectedLabel = resourceManager.getString("components", "toggleSwitchUnselectedLabel");
		}
		
		override protected function createChildren():void {
			super.createChildren();
			contents = new UIComponent();
			addChild(contents);
			drawTrack();
			drawThumb();
			drawLabel();
		}
		
		override protected function measure():void {
			// The skin must be at least as large as the thumb
			measuredMinWidth = trackWidth;
			measuredMinHeight = trackHeight;
			
			var labelWidth:Number = getElementPreferredWidth(selectedLabelDisplay);
			measuredWidth = trackWidth + labelWidth;
			measuredHeight = trackHeight;
		}
		
		override protected function commitCurrentState():void {
			toggleSelectionState();
			layoutThumbs();
			layoutLabel()
		}
		
		//The label is called selectedLabelDisplay because the hostComponent expects it
		protected function drawLabel():void {
			selectedLabelDisplay = new LabelDisplayComponent();
			selectedLabelDisplay.id = "selectedLabelDisplay";
			selectedLabelDisplay.text = selectedLabel;
			setElementSize(selectedLabelDisplay, thumb.width, thumb.height);
			contents.addChild(selectedLabelDisplay);
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
		
		//Label display sould be at the same location as the thumb
		protected function layoutLabel():void {
			if (selectedLabelDisplay != null) {
				if (currentState.indexOf("AndSelected") != -1) {
					setElementPosition(selectedLabelDisplay, 0, 0);
				} else {
					setElementPosition(selectedLabelDisplay, trackWidth / 2, 0);
				}
			}
		}
		
		//Depending on current state, update skinpart thumb accordingly
		protected function toggleSelectionState():void {
			if (currentState.indexOf("AndSelected") != -1) {
				selectedLabelDisplay.text = selectedLabel;
				track.alpha = 1;
			} else {
				track.alpha = 0.4;
				selectedLabelDisplay.text = unselectedLabel;
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
			setElementPosition(selectedLabelDisplay, x, y);
		}
	}
}
import mx.core.UIComponent;

import spark.components.supportClasses.StyleableTextField;
import spark.core.IDisplayText;

/**
 *  @private
 *  Component combining two labels to create the effect of text and its drop
 *  shadow. The component can be used with advanced style selectors and the
 *  styles "color", "textShadowColor", and "textShadowAlpha". Based off of
 *  ActionBar.TitleDisplayComponent. These two should eventually be factored.
 */
class LabelDisplayComponent extends UIComponent implements IDisplayText {
	public var shadowYOffset:Number = 0;
	
	private var labelChanged:Boolean = false;
	
	private var labelDisplay:StyleableTextField;
	
	private var labelDisplayShadow:StyleableTextField;
	
	private var _text:String;
	
	public function LabelDisplayComponent() {
		super();
		_text = "";
	}
	
	override public function get baselinePosition():Number {
		return labelDisplay.baselinePosition;
	}
	
	override protected function createChildren():void {
		super.createChildren();
		
		labelDisplay = StyleableTextField(createInFontContext(StyleableTextField));
		labelDisplay.styleName = this;
		labelDisplay.editable = false;
		labelDisplay.selectable = false;
		labelDisplay.multiline = false;
		labelDisplay.wordWrap = false;
		
		addChild(labelDisplay);
	}
	
	override protected function commitProperties():void {
		super.commitProperties();
		
		if (labelChanged) {
			labelDisplay.text = text;
			invalidateSize();
			invalidateDisplayList();
			labelChanged = false;
		}
	}
	
	override protected function measure():void {
		if (labelDisplay.isTruncated)
			labelDisplay.text = text;
		labelDisplay.commitStyles();
		measuredWidth = labelDisplay.getPreferredBoundsWidth();
		measuredHeight = labelDisplay.getPreferredBoundsHeight();
	}
	
	override protected function updateDisplayList(unscaledWidth:Number, unscaledHeight:Number):void {
		if (labelDisplay.isTruncated)
			labelDisplay.text = text;
		labelDisplay.commitStyles();
		
		var labelHeight:Number = labelDisplay.getPreferredBoundsHeight();
		var labelY:Number = (unscaledHeight - labelHeight) / 2;
		
		var labelWidth:Number = Math.min(unscaledWidth, labelDisplay.getPreferredBoundsWidth());
		var labelX:Number = (unscaledWidth - labelWidth) / 2;
		
		labelDisplay.setLayoutBoundsSize(labelWidth, labelHeight);
		labelDisplay.setLayoutBoundsPosition(labelX, labelY);
		
		labelDisplay.truncateToFit();
	}
	
	public function get text():String {
		return _text;
	}
	
	public function set text(value:String):void {
		_text = value;
		labelChanged = true;
		invalidateProperties();
	}
	
	public function get isTruncated():Boolean {
		return labelDisplay.isTruncated;
	}
}
