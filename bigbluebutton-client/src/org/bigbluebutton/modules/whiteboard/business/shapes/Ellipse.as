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
	import org.bigbluebutton.modules.whiteboard.models.Annotation;

	/**
	 * The Ellipse class. Extends the DrawObject 
	 * @author dzgonjan
	 * 
	 */	
	public class Ellipse extends DrawObject
	{
        public function Ellipse(id:String, type:String, status:String)
        {
            super(id, type, status);
        }
        

        override public function draw(a:Annotation, parentWidth:Number, parentHeight:Number, zoom:Number):void {
//            LogUtil.debug("Drawing ELLIPSE");

            var ao:Object = a.annotation;
            
            
            if(!ao.fill)
                this.graphics.lineStyle(ao.thickness * zoom, ao.color, ao.transparency ? 0.6 : 1.0);
            else this.graphics.lineStyle(ao.thickness * zoom, ao.color);
            
            var arrayEnd:Number = (ao.points as Array).length;
            var startX:Number = denormalize((ao.points as Array)[0], parentWidth);
            var startY:Number = denormalize((ao.points as Array)[1], parentHeight);
            var width:Number = denormalize((ao.points as Array)[arrayEnd-2], parentWidth) - startX;
            var height:Number = denormalize((ao.points as Array)[arrayEnd-1], parentHeight) - startY;
            
            if (ao.fill) this.graphics.beginFill(ao.fillColor, ao.transparency ? 0.6 : 1.0);
			if (ao.circle) {
                //calculate what how to draw circle in different directions
                //from starting point
                if(height < 0){
                    if(width<0)
    				    this.graphics.drawEllipse(startX, startY, width, width);
                    else
                        this.graphics.drawEllipse(startX, startY, width, -width);
                }
                else{
                    if(width<0)
                        this.graphics.drawEllipse(startX, startY, width, -width);
                    else
                        this.graphics.drawEllipse(startX, startY, width, width);
                }


			} else {
				this.graphics.drawEllipse(startX, startY, width, height);
			}
            
        }
        
        override public function redraw(a:Annotation, parentWidth:Number, parentHeight:Number, zoom:Number):void {
            draw(a, parentWidth, parentHeight, zoom);
        }
	}
}