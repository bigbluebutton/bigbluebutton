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

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

import org.bigbluebutton.conference.service.whiteboard.WBGraphic.Type;

public class Page {
	
	private HashMap<String, WBGraphic> graphicObjs;
	private int pageIndex;
	private boolean isGrid = false;
	
	public Page(int pageIndex){
		this.graphicObjs = new HashMap<String, WBGraphic>();
		this.setPageIndex(pageIndex);
	}
	
	public void addShapeGraphic(ShapeGraphic shape){
		graphicObjs.put(shape.ID, shape);
		System.out.println("Total shape count: " + graphicObjs.size());
	}
	
	public void addTextGraphic(TextGraphic text){
		graphicObjs.put(text.ID, text);
	}
	
	public void modifyShapeGraphic(ShapeGraphic shape){
		if(graphicObjs.containsKey(shape.ID))
			graphicObjs.put(shape.ID, shape);
		else System.out.println("ERROR: MODIFYING NON-EXISTENT KEY: " + shape.ID);
	}
	
	public void modifyTextGraphic(TextGraphic text){
		if(graphicObjs.containsKey(text.ID))
			graphicObjs.put(text.ID, text);
		else System.out.println("ERROR: MODIFYING NON-EXISTENT KEY: " + text.ID);
	}
	
	public List<Object[]> getHistory(){
		List<Object[]> graphics = new ArrayList<Object[]>();
		for (WBGraphic g: graphicObjs.values()){
			graphics.add(g.toObjectArray());
		}
		Object[] isGridArray = new Object[1];
		isGridArray[0] = isGrid;
		graphics.add(isGridArray);
		System.out.println("There are currently " + graphicObjs.size() + " graphical objects on the current page");
		return graphics;
	}
	
	public List<Object[]> getWBShapes(){
		List<Object[]> shapes = new ArrayList<Object[]>();
		for (WBGraphic g: graphicObjs.values()){
			if(g.graphicType == Type.SHAPE)
				shapes.add(g.toObjectArray());
		}
		return shapes;
	}
	
	public List<Object[]> getWBTexts(){
		List<Object[]> texts = new ArrayList<Object[]>();
		for (WBGraphic g: graphicObjs.values()){
			if(g.graphicType == Type.TEXT)
				texts.add(g.toObjectArray());
		}
		return texts;
	}
	
	public Map<String, WBGraphic> getWBGraphicMap(){
		return graphicObjs;
	}
	
	public void clear(){
		graphicObjs.clear();
	}
	
	public void undo(){
		graphicObjs.remove(Integer.toString(graphicObjs.size()-1));
	}
	
	public void toggleGrid() {
		System.out.println("Toggling grid mode on page " + pageIndex);
		isGrid = !isGrid;
	}
	
	public boolean isGrid() {
		return isGrid;
	}
	
	public int getNumGraphicsOnPage(){
		return this.graphicObjs.size();
	}

	public void setPageIndex(int pageIndex) {
		this.pageIndex = pageIndex;
	}

	public int getPageIndex() {
		return pageIndex;
	}


}
