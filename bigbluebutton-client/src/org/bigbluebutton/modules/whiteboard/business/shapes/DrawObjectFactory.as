/**
* BigBlueButton open source conferencing system - http://www.bigbluebutton.org/
*
* Copyright (c) 2010 BigBlueButton Inc. and by respective authors (see below).
*
* This program is free software; you can redistribute it and/or modify it under the
* terms of the GNU Lesser General Public License as published by the Free Software
* Foundation; either version 2.1 of the License, or (at your option) any later
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
    import org.bigbluebutton.common.LogUtil;
    import org.bigbluebutton.modules.whiteboard.models.Annotation;
    import org.bigbluebutton.modules.whiteboard.models.WhiteboardModel;

	/**
	 * The DrawObjectFactory class receives a series of parameters and constructs an appropriate 
	 * concrete DrawObject given those parameters.
	 * <p>
	 * DrawObjectFactory is a simple implementation of the Factory design pattern 
	 * @author dzgonjan
	 * 
	 */	
	public class DrawObjectFactory
	{
		public function makeDrawObject(a:Annotation, whiteboardModel:WhiteboardModel):DrawObject{
            if (a.type == DrawObject.PENCIL) {
                LogUtil.debug("Creating SCRIBBLE Annotation");
                return new Pencil(a.id, a.type, a.status);
            } else if (a.type == DrawObject.RECTANGLE) {
                LogUtil.debug("Creating RECTANGLE Annotation");
                return new Rectangle(a.id, a.type, a.status);
            } else if (a.type == DrawObject.ELLIPSE) {
                LogUtil.debug("Creating ELLIPSE Annotation");
                return new Ellipse(a.id, a.type, a.status);
            }  else if (a.type == DrawObject.LINE) {
				LogUtil.debug("Creating LINE Annotation");
				return new Line(a.id, a.type, a.status);
			}  else if (a.type == DrawObject.TRIANGLE) {
				LogUtil.debug("Creating TRIANGLE Annotation");
				return new Triangle(a.id, a.type, a.status);
			}
            
            return null;
		}

	}
}