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

package org.bigbluebutton.modules.whiteboard.business.shapes
{
  import flash.text.TextField;
  import flash.text.TextFormat;
  import flash.text.TextFormatAlign;
  
  import org.bigbluebutton.modules.whiteboard.business.shapes.DrawObject;
  import org.bigbluebutton.modules.whiteboard.models.Annotation;
  
  public class PollResultObject extends DrawObject {
    private const sx:int = 0;
    private const sy:int = 0;
    //private const h:uint = 100;
    //private const w:uint = 280;
    private const bgFill:uint = 0XCECECE; //0xFFFFFF;
    private const colFill:uint = 0x000000;
    private const vpadding:Number = 10;
    private const hpadding:Number = 5;
    private const labelStartWidth:int = 40;
    private const percentStartWidth:int = 40;
    
    private var sampledata:Array = [{a:"A", v:3}, {a:"B", v:1}, {a:"C", v:5}, {a:"D", v:8}];
    private var _data:Array;
    private var _textFields:Array;

    public function PollResultObject(id:String, type:String, status:String) {
      super(id, type, status)
      
      _textFields = new Array();
      data = null;
      // temp setter for testing purposes
      //data = sampledata;
      
    }
    
    public function set data(d:Array):void {
      _data = d;
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
    
    private function updateDisplayList(unscaledWidth:Number, unscaledHeight:Number):void {
//      graphics.clear();
    
      if (_data != null && _data.length > 0) {
        graphics.lineStyle(2);
        graphics.beginFill(bgFill, 1.0);
        graphics.drawRect(sx, sy, unscaledWidth, unscaledHeight);
        graphics.endFill();
        
        var actualRH:Number = (unscaledHeight-vpadding*(_data.length+1)) / _data.length;
        trace("PollGraphic - as raw " + actualRH +" int " + int(actualRH));
        // Current problem is that the rowHeight is truncated. It would be nice if the extra pixels 
        // could be distributed for a more even look.
        var avgRowHeight:int = (unscaledHeight-vpadding*(_data.length+1)) / _data.length;
        var extraVPixels:int = unscaledHeight - (_data.length * (avgRowHeight+vpadding) + vpadding);
        trace("PollGraphic - extraVPixels " + extraVPixels);
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
        var minFontSize:int = 20;
        var currFontSize:int;
        
        graphics.lineStyle(2);
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
          answerText.width = labelStartWidth;
          answerText.height = curRowHeight;
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
          var percentNum:Number = (totalCount == 0 ? 0 : ((_data[j].v/totalCount)*100));
          percentText.text = Math.round(percentNum).toString() + "%";
          percentText.width = percentStartWidth;
          percentText.height = curRowHeight;
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
          countText.width = rectWidth;
          countText.height = curRowHeight;
          countText.textColor = 0xFFFFFF;
          countText.selectable = false;
          //addChild(countText);
          findFontSize(countText, minFontSize);
          countText.width = countText.textWidth+4;
          countText.height = countText.textHeight+4;
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
    
    private function drawRect(a:Annotation, parentWidth:Number, parentHeight:Number, zoom:Number):void {
      var ao:Object = a.annotation;
      this.graphics.lineStyle(1 * zoom, 0);
      
      var arrayEnd:Number = (ao.points as Array).length;
      var startX:Number = denormalize(21.845575, parentWidth);
      var startY:Number = denormalize(23.145401, parentHeight);
      var width:Number = denormalize(46.516006, parentWidth) - startX;
      var height:Number = denormalize(61.42433, parentHeight) - startY;
      
      this.graphics.drawRect(startX, startY, width, height);
      
    }
    
    override public function draw(a:Annotation, parentWidth:Number, parentHeight:Number, zoom:Number):void {
      var ao:Object = a.annotation;
      trace("RESULT = " + JSON.stringify(a));

      var arrayEnd:Number = (ao.points as Array).length;
      var startX:Number = denormalize((ao.points as Array)[0], parentWidth);
      var startY:Number = denormalize((ao.points as Array)[1], parentHeight);
      var pwidth:Number = denormalize((ao.points as Array)[2], parentWidth) - startX;
      var pheight:Number = denormalize((ao.points as Array)[3], parentHeight) - startY;
           
      var answers:Array = ao.result as Array;
      var ans:Array = new Array();
      for (var j:int = 0; j < answers.length; j++) {
	      var ar:Object = answers[j];
	      var rs:Object = {a: ar.key, v: ar.num_votes as Number};
	      trace("poll result a=[" + ar.key + "] v=[" + ar.num_votes +"]");
	      ans.push(rs);
      }
      
	  data = ans;
	  makeTextFields((answers != null ? answers.length*3 : 0));
	  
	  updateDisplayList(pwidth, pheight);
	  
    }
    
    override public function redraw(a:Annotation, parentWidth:Number, parentHeight:Number, zoom:Number):void {
      draw(a, parentWidth, parentHeight, zoom);
    }
  }
}