/** 
* ===License Header===
*
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
* ===License Header===
*/
package org.bigbluebutton.conference.service.whiteboard;

import java.util.List;

import org.red5.compatibility.flex.messaging.io.ArrayCollection;
import org.red5.logging.Red5LoggerFactory;
import org.slf4j.Logger;

public class WhiteboardService {

	private static Logger log = Red5LoggerFactory.getLogger(WhiteboardService.class, "bigbluebutton");
	
	private WhiteboardApplication application;
	
	public void setWhiteboardApplication(WhiteboardApplication a){
		log.debug("Setting whiteboard application instance");
		this.application = a;
	}
	
	public void sendShape(double[] shape, String type, int color, int thickness, String id, String status){
		log.info("WhiteboardApplication - Sending share");
		application.sendShape(shape, type, color, thickness, id, status);
	}
	
	/**
	 * Sets the active page
	 * @param pageNum - the number of the page to set to active
	 * @return - returns the number of shapes in the history of the requested page. This way the client can perform a simple check of whether
	 * it should retrieve the page history. This saves some bandwidth for the server.
	 */
	public int setActivePage(int pageNum){
		log.info("WhiteboardApplication - Getting number of shapes for page: " + pageNum);
		return application.getNumShapesOnPage(pageNum);
	}
	
	public List<Object[]> getShapes(){
		log.info("WhiteboardApplication - Returning shapes");
		List<Object[]> shapes = application.getShapes();
		
		/*System.out.println("Number of shapes: " + shapes.size());
		System.out.println("First shape. Num params: " + shapes.get(0).length);
		System.out.println("double[] : " + (double[])shapes.get(0)[0]);
		System.out.println("type : " + shapes.get(0)[1]);
		System.out.println("color : " + shapes.get(0)[2]);
		System.out.println("thickness : " + shapes.get(0)[3]);
		System.out.println("parentWidth : " + shapes.get(0)[4]);
		System.out.println("parentHeight : " + shapes.get(0)[5]);*/
		
		return shapes;
	}
	
	public void clear(){
		log.info("WhiteboardApplication - Clearing board");
		application.clear();
	}
	
	public void undo(){
		log.info("WhiteboardApplication - Deleting last shape");
		application.undo();
	}
	
	public void setActivePresentation(String name, int numPages){
		log.info("WhiteboardApplication - Setting active presentation: " + name);
		application.setActivePresentation(name, numPages);
	}
	
	public void enableWhiteboard(boolean enable){
		log.info("WhiteboardApplication - Setting whiteboard enabled: " + enable);
		application.enableWhiteboard(enable);
	}
	
	public boolean isWhiteboardEnabled(){
		return application.isWhiteboardEnabled();
	}
	
}
