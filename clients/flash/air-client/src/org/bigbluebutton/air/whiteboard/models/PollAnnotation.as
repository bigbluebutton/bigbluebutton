package org.bigbluebutton.air.whiteboard.models {
	
	import flash.display.CapsStyle;
	import flash.display.JointStyle;
	import flash.text.TextFormat;
	import flash.text.TextFormatAlign;
	
	import spark.components.Group;
	import spark.core.SpriteVisualElement;
	
	import spark.components.supportClasses.StyleableTextField;
	
	import org.as3commons.lang.StringUtils;
	
	public class PollAnnotation extends Annotation {
		private const marginFill:uint = 0xFFFFFF;
		private const bgFill:uint = 0xFFFFFF;
		private const colFill:uint = 0x333333;
		private const margin:Number = 0.025;
		private const vPaddingPercent:Number = 0.25;
		private const hPaddingPercent:Number = 0.1;
		private const labelWidthPercent:Number = 0.3;
		
		private var _container:Group;
		private var _graphics:SpriteVisualElement;
		
		private var _textFields:Array;
		private var _data:Array;
		
		public function PollAnnotation(id:String, userId:String, type:String, status:String, annInfo:Object) {
			super(id, userId, type, status, annInfo);
			
			_textFields = new Array();
		}
		
		override protected function makeGraphic():void {
			_graphics.graphics.clear();
			
			if (_data != null && _data.length > 0) {
				var startX:Number = denormalize((_annInfo.points as Array)[0], _parentWidth);
				var startY:Number = denormalize((_annInfo.points as Array)[1], _parentHeight);
				var localWidth:Number = denormalize((_annInfo.points as Array)[2], _parentWidth);
				var localHeight:Number = denormalize((_annInfo.points as Array)[3], _parentHeight);
				
				var lineWidth:Number = 0.008 * localWidth;
				
				_container.x = startX;
				_container.y = startY;
				
				_graphics.graphics.lineStyle(0, marginFill);
				_graphics.graphics.beginFill(marginFill, 1.0);
				_graphics.graphics.drawRect(0, 0, localWidth, localHeight);
				_graphics.graphics.endFill();
				
				var calcMargin:int = localWidth * margin;
				var graphX:int = calcMargin;
				var graphY:int = calcMargin;
				var graphWidth:int = localWidth - calcMargin*2;
				var graphHeight:int = localHeight - calcMargin*2;
				
				_graphics.graphics.lineStyle(lineWidth, colFill, 1.0, true, "normal", CapsStyle.NONE, JointStyle.MITER);
				_graphics.graphics.beginFill(bgFill, 1.0);
				_graphics.graphics.drawRect(calcMargin, calcMargin, graphWidth, graphHeight);
				_graphics.graphics.endFill();
				
				var vpadding:int = (graphHeight*vPaddingPercent)/(_data.length+1);
				var hpadding:int = (graphWidth*hPaddingPercent)/(4);
				
				var actualRH:Number = (graphHeight-vpadding*(_data.length+1)) / _data.length;
				trace("PollGraphic - as raw {0} int {1}", [actualRH, int(actualRH)]);
				// Current problem is that the rowHeight is truncated. It would be nice if the extra pixels 
				// could be distributed for a more even look.
				var avgRowHeight:int = (graphHeight-vpadding*(_data.length+1)) / _data.length;
				var extraVPixels:int = graphHeight - (_data.length * (avgRowHeight+vpadding) + vpadding);
				trace("PollGraphic - extraVPixels {0}", [extraVPixels]);
				var largestVal:int = -1;
				var totalCount:Number = 0;
				//find largest value
				for (var i:int=0; i<_data.length; i++) {
					if (_data[i].v > largestVal) largestVal = _data[i].v;
					totalCount += _data[i].v;
				}
				
				var currTFIdx:int = 0;
				var answerText:StyleableTextField;
				var percentText:StyleableTextField;
				var answerArray:Array = new Array();
				var percentArray:Array = new Array();
				var minFontSize:int = avgRowHeight + vpadding;
				var currFontSize:int;
				
				//var startingLabelWidth:Number = Math.min(labelWidthPercent*graphWidth, labelMaxWidthInPixels);
				var startingLabelWidth:Number = labelWidthPercent*graphWidth;
				
				_graphics.graphics.lineStyle(lineWidth, colFill, 1.0, true, "normal", CapsStyle.NONE, JointStyle.MITER);
				_graphics.graphics.beginFill(colFill, 1.0);
				for (var j:int=0, vp:int=extraVPixels, ry:int=graphY, curRowHeight:int=0; j<_data.length; j++) {
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
					//addChild(answerText);
					answerArray.push(answerText);
					currFontSize = findFontSize(answerText, minFontSize);
					if (currFontSize < minFontSize) minFontSize = currFontSize;
					//rowText.height = rowText.textHeight;
					answerText.x = graphX + hpadding;
					//rowText.y = ry-rowText.height/2;
					
					// add percentage
					percentText = _textFields[currTFIdx++];;// new TextField();
					var percentNum:Number = (totalCount == 0 ? 0 : ((_data[j].v/totalCount)*100));
					percentText.text = Math.round(percentNum).toString() + "%";
					percentText.width = startingLabelWidth;
					percentText.height = curRowHeight;
					//addChild(percentText);
					percentArray.push(percentText);
					currFontSize = findFontSize(percentText, minFontSize);
					if (currFontSize < minFontSize) minFontSize = currFontSize;
					//percentText.height = percentText.textHeight;
					//percentText.x = graphWidth-percentStartWidth/2-percentText.width/2;
					//percentText.y = ry-percentText.height/2;
				}
				
				var maxAnswerWidth:int = 0;
				var maxPercentWidth:int = 0;
				
				for (j=0, vp=extraVPixels, ry=graphY, curRowHeight=0; j<_data.length; j++) {
					ry += Math.round(curRowHeight/2)+vpadding; // add the last row's height plus padding
					
					curRowHeight = avgRowHeight;
					if (j%2==0 && vp > 0) {
						curRowHeight += 1;
						vp--;
					}
					ry += curRowHeight/2;
					
					//ry = curRowHeight * (j+0.5) + vpadding*(j+1);
					
					answerText = StyleableTextField(answerArray[j]);
					findFontSize(answerText, minFontSize);
					answerText.width = answerText.textWidth+4;
					answerText.height = answerText.textHeight+4;
					answerText.textColor = colFill;
					answerText.y = ry-answerText.height/2;
					if (answerText.width > maxAnswerWidth) maxAnswerWidth = answerText.width;
					
					percentText = StyleableTextField(percentArray[j]);
					findFontSize(percentText, minFontSize);
					percentText.width = percentText.textWidth+4;
					percentText.height = percentText.textHeight+4;
					percentText.textColor = colFill;
					percentText.x = graphX + graphWidth - hpadding - percentText.width;
					percentText.y = ry-percentText.height/2;
					if (percentText.width > maxPercentWidth) maxPercentWidth = percentText.width;
					
				}
				//trace("font size set to " + minFontSize);
				
				var countText:StyleableTextField;
				var maxBarWidth:int = graphWidth - (hpadding*4) - maxAnswerWidth - maxPercentWidth;
				var barStartX:int = graphX + maxAnswerWidth + (hpadding*2);
				
				for (j=0, vp=extraVPixels, ry=graphY, curRowHeight=0; j<_data.length; j++) {
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
					_graphics.graphics.drawRect(barStartX, ry-curRowHeight/2, rectWidth, curRowHeight);
					// add vote count in middle of rect
					countText = _textFields[currTFIdx++]; // new TextField();
					countText.text = _data[j].v;
					countText.width = startingLabelWidth;
					countText.height = curRowHeight;
					countText.textColor = bgFill;
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
				
				_graphics.graphics.endFill();
			}
		}
		
		override public function update(an:Annotation):void {
			if (an.id == this.id) {
				_status = an.status;
				_annInfo = an.annInfo;
				
				if (shouldDraw()) {
					createAnswerArray();
					makeGraphic();
				}
			}
		}
		
		override public function draw(canvas:Group):void {
			if (!_container) {
				_container = new Group();
				_graphics = new SpriteVisualElement();
				_container.addElement(_graphics);
			}
			
			createAnswerArray();
			super.draw(canvas);
			
			if (!canvas.containsElement(_container)) {
				canvas.addElement(_container);
				// text sizing doesn't seem to work on AIR unless the text is on 
				// the stage so need to remake after it has been added
				canvas.callLater(makeGraphic);
			}
		}
		
		override public function remove(canvas:Group):void {
			if (canvas.containsElement(_container)) {
				canvas.removeElement(_container);
				_graphics = null;
				_container = null;
				super.remove(canvas);
			}
		}
		
		private function createAnswerArray():void {
			var answers:Array = _annInfo.result as Array;
			var ans:Array = new Array();
			for (var j:int = 0; j < answers.length; j++) {
				var ar:Object = answers[j];
				var localizedKey: String = ar.key;
				
				if (StringUtils.isEmpty(localizedKey) || localizedKey == "undefined") {
					localizedKey = ar.key;
				} 
				var rs:Object = {a: localizedKey, v: ar.numVotes};
				ans.push(rs);
			}
			
			_data = ans;
			makeTextFields((answers != null ? answers.length*3 : 0));
		}
		
		private function makeTextFields(num:int):void {
			if (num > _textFields.length) {
				var textField:StyleableTextField;
				for (var i:int=_textFields.length; i < num; i++) {
					textField = new StyleableTextField();
					textField.selectable = false;
					_container.addElement(textField);
					_textFields.push(textField);
				}
			} else if (num < _textFields.length) {
				for (var j:int=_textFields.length; i > num; i--) {
					_container.removeElement(_textFields.pop());
				}
			}
		}
		
		private function findFontSize(textField:StyleableTextField, defaultSize:Number):int {
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