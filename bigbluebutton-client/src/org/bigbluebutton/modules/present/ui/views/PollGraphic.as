package org.bigbluebutton.modules.present.ui.views
{
	import flash.text.TextField;
	import flash.text.TextFormat;
	import flash.text.TextFormatAlign;
	
	import mx.containers.Canvas;
	import mx.core.UIComponent;
	
	public class PollGraphic extends UIComponent {
		private const sx:int = 0;
		private const sy:int = 0;
		//private const h:uint = 100;
		//private const w:uint = 280;
		private const bgFill:uint = 0xFFFFFF;
		private const colFill:uint = 0x000000;
		private const vpadding:Number = 10;
		private const hpadding:Number = 5;
		private const labelStartWidth:int = 40;
		private const percentStartWidth:int = 40;
		
		private var sampledata:Array = [{a:"A", v:3}, 
									{a:"B", v:1},
									{a:"C", v:5},
									{a:"D", v:8}];
		private var _data:Array;
		private var _textFields:Array;
		
		public function PollGraphic() {
			super();
			hasFocusableChildren = false;
			_textFields = new Array();
			data = null;
			// temp setter for testing purposes
			data = sampledata;
		}
		
		public function set data(d:Array):void {
			makeTextFields((d != null ? d.length*3 : 0));
			_data = d;
			invalidateDisplayList();
		}
		
		private function makeTextFields(num:int):void {
			if (num > _textFields.length) {
				var textField:TextField;
				for (var i:int=_textFields.length; i < num; i++) {
					textField = new TextField();
					addChild(textField);
					_textFields.push(textField);
				}
			} else if (num < _textFields.length) {
				for (var j:int=_textFields.length; i > num; i--) {
					removeChild(_textFields.pop());
				}
			}
		}
		
		override protected function updateDisplayList(unscaledWidth:Number, unscaledHeight:Number):void {
			super.updateDisplayList(unscaledWidth, unscaledHeight);
			
			graphics.clear();
		
			if (_data != null && _data.length > 0) {
				graphics.lineStyle(2);
				graphics.beginFill(bgFill, 1.0);
				graphics.drawRect(sx, sy, unscaledWidth, unscaledHeight);
				graphics.endFill();
				
				var rowHeight:int = (unscaledHeight-vpadding*(_data.length+1)) / _data.length;
				var largestVal:int = -1;
				var totalCount:int = 0;
				//find largest value
				for (var i:int=0; i<_data.length; i++) {
					if (_data[i].v > largestVal) largestVal = _data[i].v;
					totalCount += _data[i].v;
				}
				
				var currTFIdx:int = 0;
				var answerText:TextField;
				var percentText:TextField;
				var ry:int
				var answerArray:Array = new Array();
				var percentArray:Array = new Array();
				var minFontSize:int = 20;
				var currFontSize:int;
				
				graphics.lineStyle(2);
				graphics.beginFill(colFill, 1.0);
				for (var j:int=0; j<_data.length; j++) {
					ry = rowHeight * (j+0.5) + vpadding*(j+1);
					// add row label
					answerText = _textFields[currTFIdx++];
					answerText.text = _data[j].a;
					answerText.width = labelStartWidth;
					answerText.height = rowHeight;
					answerText.selectable = false;
					//addChild(answerText);
					answerArray.push(answerText);
					currFontSize = findFontSize(answerText, 20);
					if (currFontSize < minFontSize) minFontSize = currFontSize;
					//rowText.height = rowText.textHeight;
					answerText.x = hpadding;
					//rowText.y = ry-rowText.height/2;
					
					// add percentage
					percentText = _textFields[currTFIdx++];;// new TextField();
					percentText.text = ((_data[j].v/totalCount)*100).toFixed(0) + "%";
					percentText.width = percentStartWidth;
					percentText.height = rowHeight;
					percentText.selectable = false;
					//addChild(percentText);
					percentArray.push(percentText);
					currFontSize = findFontSize(percentText, 20);
					if (currFontSize < minFontSize) minFontSize = currFontSize;
					//percentText.height = percentText.textHeight;
					//percentText.x = unscaledWidth-percentStartWidth/2-percentText.width/2;
					//percentText.y = ry-percentText.height/2;
				}
				
				var maxAnswerWidth:int = 0;
				var maxPercentWidth:int = 0;
				
				for (j=0; j<_data.length; j++) {
					ry = rowHeight * (j+0.5) + vpadding*(j+1);
					
					answerText = TextField(answerArray[j]);
					findFontSize(answerText, minFontSize);
					answerText.width = answerText.textWidth+4;
					answerText.height = answerText.textHeight;
					answerText.y = ry-answerText.height/2;
					if (answerText.width > maxAnswerWidth) maxAnswerWidth = answerText.width;
					
					percentText = TextField(percentArray[j]);
					findFontSize(percentText, minFontSize);
					percentText.width = percentText.textWidth+4;
					percentText.height = percentText.textHeight;
					percentText.x = unscaledWidth - hpadding - percentText.width;
					percentText.y = ry-percentText.height/2;
					if (percentText.width > maxPercentWidth) maxPercentWidth = percentText.width;
					
				}
				
				var countText:TextField;
				var maxBarWidth:int = unscaledWidth - (hpadding*4) - maxAnswerWidth - maxPercentWidth;
				var barStartX:int = maxAnswerWidth + (hpadding*2);
				
				for (j=0; j<_data.length; j++) {
					ry = rowHeight * (j+0.5) + vpadding*(j+1);
					// draw rect
					var rectWidth:int = maxBarWidth*(_data[j].v/largestVal);
					graphics.drawRect(barStartX, ry-rowHeight/2, rectWidth, rowHeight);
					// add vote count in middle of rect
					countText = _textFields[currTFIdx++]; // new TextField();
					countText.text = _data[j].v;
					countText.width = rectWidth;
					countText.height = rowHeight;
					countText.textColor = 0xFFFFFF;
					countText.selectable = false;
					//addChild(countText);
					findFontSize(countText, minFontSize);
					countText.width = countText.textWidth+4;
					countText.height = countText.textHeight;
					countText.x = barStartX+rectWidth/2-countText.width/2;
					countText.y = ry-countText.height/2;
				}
				
				graphics.endFill();
			}
		}
		
		private function findFontSize(textField:TextField, defaultSize:Number):int {
			var tFormat:TextFormat = new TextFormat();
			tFormat.size = defaultSize;
			tFormat.align = TextFormatAlign.CENTER;
			textField.setTextFormat(tFormat);
			var size:Number = defaultSize;
			while((textField.textWidth+4 > textField.width || textField.textHeight+4 > textField.height) && size > 0) {
				size = size - 1;
				tFormat.size = size;
				textField.setTextFormat(tFormat);
			}
			
			return size;
		}
	}
}