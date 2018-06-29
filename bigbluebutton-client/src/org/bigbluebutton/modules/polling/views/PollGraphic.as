/**
 * BigBlueButton open source conferencing system - http://www.bigbluebutton.org/
 * 
 * Copyright (c) 2012 BigBlueButton Inc. and by respective authors (see below).
 *
 * This program is free software; you can redistribute it and/or modify it under the
 * terms of the GNU Lesser General Public License as published by the Free Software
 * Foundation; either version 3.0 of the License, or (at your option) any later
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

package org.bigbluebutton.modules.polling.views
{
	import flash.text.TextField;
	import flash.text.TextFormat;
	import flash.text.TextFormatAlign;
	
	import mx.core.UIComponent;
	
	import org.as3commons.logging.api.ILogger;
	import org.as3commons.logging.api.getClassLogger;
	
	public class PollGraphic extends UIComponent {
		private static const LOGGER:ILogger = getClassLogger(PollGraphic);      

		private const sx:int = 0;
		private const sy:int = 0;
		private const bgFill:uint = 0xFFFFFF;
		private const colFill:uint = 0x333333;
		private const vPaddingPercent:Number = 0.25;
		private const hPaddingPercent:Number = 0.1;
		private const labelWidthPercent:Number = 0.3;
		
		private var _data:Array;
		private var _textFields:Array;
		
		public function PollGraphic() {
			super();
			hasFocusableChildren = false;
			_textFields = new Array();
			data = null;
		}
		
		public function set data(d:Array):void {
			makeTextFields((d != null ? d.length*3 : 0));
			_data = d;
			invalidateDisplayList();
		}
		
		public function get data():Array {
			return _data;
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
				graphics.lineStyle(2, colFill);
				graphics.beginFill(bgFill, 1.0);
				graphics.drawRect(sx, sy, unscaledWidth, unscaledHeight);
				graphics.endFill();
				
				var vpadding:int = (unscaledHeight*vPaddingPercent)/(_data.length+1);
				var hpadding:int = (unscaledWidth*hPaddingPercent)/(4);
				
				var actualRH:Number = (unscaledHeight-vpadding*(_data.length+1)) / _data.length;
				LOGGER.debug("PollGraphic - as raw {0} int {1}", [actualRH, int(actualRH)]);
				// Current problem is that the rowHeight is truncated. It would be nice if the extra pixels 
				// could be distributed for a more even look.
				var avgRowHeight:int = (unscaledHeight-vpadding*(_data.length+1)) / _data.length;
				var extraVPixels:int = unscaledHeight - (_data.length * (avgRowHeight+vpadding) + vpadding);
				LOGGER.debug("PollGraphic - extraVPixels {0}", [extraVPixels]);
				var largestVal:int = -1;
				var totalCount:Number = 0;
				//find largest value
				for (var i:int=0; i<_data.length; i++) {
					if (_data[i].v > largestVal) largestVal = _data[i].v;
					totalCount += _data[i].v;
				}
				
				var currTFIdx:int = 0;
				var answerText:TextField;
				var percentText:TextField;
				var answerArray:Array = new Array();
				var percentArray:Array = new Array();
				var minFontSize:int = 30;
				var currFontSize:int;
				
				//var startingLabelWidth:Number = Math.min(labelWidthPercent*unscaledWidth, labelMaxWidthInPixels);
				var startingLabelWidth:Number = labelWidthPercent*unscaledWidth;
				
				graphics.lineStyle(2, colFill);
				graphics.beginFill(colFill, 1.0);
				for (var j:int=0, vp:int=extraVPixels, ry:int=0, curRowHeight:int=0; j<_data.length; j++) {
					ry += Math.round(curRowHeight/2)+vpadding; // add the last row's height plus padding
					
					curRowHeight = avgRowHeight;
					if (j%2==0 && vp > 0) {
						curRowHeight += 1;
						vp--;
					}
					ry += curRowHeight/2;
					
					//ry += curRowHeight * (j+0.5) + vpadding*(j+1);
					// add row label
					answerText = _textFields[currTFIdx++];
					answerText.text = _data[j].a;
					answerText.width = startingLabelWidth;
					answerText.height = curRowHeight;
					answerText.selectable = false;
					//addChild(answerText);
					answerArray.push(answerText);
					currFontSize = findFontSize(answerText, minFontSize);
					if (currFontSize < minFontSize) minFontSize = currFontSize;
					//rowText.height = rowText.textHeight;
					answerText.x = hpadding;
					//rowText.y = ry-rowText.height/2;
					
					// add percentage
					percentText = _textFields[currTFIdx++];;// new TextField();
					var percentNum:Number = (totalCount == 0 ? 0 : ((_data[j].v/totalCount)*100));
					percentText.text = Math.round(percentNum).toString() + "%";
					percentText.width = startingLabelWidth;
					percentText.height = curRowHeight;
					percentText.selectable = false;
					//addChild(percentText);
					percentArray.push(percentText);
					currFontSize = findFontSize(percentText, minFontSize);
					if (currFontSize < minFontSize) minFontSize = currFontSize;
					//percentText.height = percentText.textHeight;
					//percentText.x = unscaledWidth-percentStartWidth/2-percentText.width/2;
					//percentText.y = ry-percentText.height/2;
				}
				
				var maxAnswerWidth:int = 0;
				var maxPercentWidth:int = 0;
				
				for (j=0, vp=extraVPixels, ry=0, curRowHeight=0; j<_data.length; j++) {
					ry += Math.round(curRowHeight/2)+vpadding; // add the last row's height plus padding
					
					curRowHeight = avgRowHeight;
					if (j%2==0 && vp > 0) {
						curRowHeight += 1;
						vp--;
					}
					ry += curRowHeight/2;
					
					//ry = curRowHeight * (j+0.5) + vpadding*(j+1);
					
					answerText = TextField(answerArray[j]);
					findFontSize(answerText, minFontSize);
					answerText.width = answerText.textWidth+4;
					answerText.height = answerText.textHeight+4;
					answerText.y = ry-answerText.height/2;
					if (answerText.width > maxAnswerWidth) maxAnswerWidth = answerText.width;
					
					percentText = TextField(percentArray[j]);
					findFontSize(percentText, minFontSize);
					percentText.width = percentText.textWidth+4;
					percentText.height = percentText.textHeight+4;
					percentText.x = unscaledWidth - hpadding - percentText.width;
					percentText.y = ry-percentText.height/2;
					if (percentText.width > maxPercentWidth) maxPercentWidth = percentText.width;
					
				}
				
				var countText:TextField;
				var maxBarWidth:int = unscaledWidth - (hpadding*4) - maxAnswerWidth - maxPercentWidth;
				var barStartX:int = maxAnswerWidth + (hpadding*2);
				
				for (j=0, vp=extraVPixels, ry=0, curRowHeight=0; j<_data.length; j++) {
					ry += Math.round(curRowHeight/2)+vpadding; // add the last row's height plus padding
					
					curRowHeight = avgRowHeight;
					if (j%2==0 && vp > 0) {
						curRowHeight += 1;
						vp--;
					}
					ry += curRowHeight/2;
					
					//ry = curRowHeight * (j+0.5) + vpadding*(j+1);
					
					// draw rect
					var rectWidth:int = maxBarWidth*(_data[j].v/largestVal);
					graphics.drawRect(barStartX, ry-curRowHeight/2, rectWidth, curRowHeight);
					// add vote count in middle of rect
					countText = _textFields[currTFIdx++]; // new TextField();
					countText.text = _data[j].v;
					countText.width = startingLabelWidth;
					countText.height = curRowHeight;
					countText.selectable = false;
					//addChild(countText);
					findFontSize(countText, minFontSize);
					countText.width = countText.textWidth+4;
					countText.height = countText.textHeight+4;
					countText.y = ry-countText.height/2;
					if (countText.width > rectWidth) {
						countText.x = barStartX + rectWidth + hpadding/2;
						countText.textColor = colFill;
					} else {
						countText.x = barStartX + rectWidth/2 - countText.width/2;
						countText.textColor = bgFill;
					}
				}
				
				graphics.endFill();
			}
		}
		
		private function findFontSize(textField:TextField, defaultSize:Number):int {
			var tFormat:TextFormat = new TextFormat();
			tFormat.size = defaultSize;
			tFormat.font = "arial";
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