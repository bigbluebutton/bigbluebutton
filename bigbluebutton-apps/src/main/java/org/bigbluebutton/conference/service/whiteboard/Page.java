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
import java.util.List;

import org.red5.compatibility.flex.messaging.io.ArrayCollection;

public class Page {
	
	private ArrayCollection<Shape> shapes;
	private int pageIndex;
	
	public Page(int pageIndex){
		this.shapes = new ArrayCollection<Shape>();
		this.setPageIndex(pageIndex);
	}
	
	public void addShape(Shape shape){
		shapes.add(shape);
	}
	
	public List<Object[]> getShapes(){
		List<Object[]> shapesCollection = new ArrayList<Object[]>();
		for (int i = 0; i<shapes.size(); i++){
			shapesCollection.add(shapes.get(i).toObjectArray());
		}
		return shapesCollection;
	}
	
	public void clear(){
		shapes.clear();
	}
	
	public void undo(){
		if(shapes.size() > 0)
			shapes.remove(shapes.size()-1);
	}
	
	public int getNumShapesOnPage(){
		return this.shapes.size();
	}

	public void setPageIndex(int pageIndex) {
		this.pageIndex = pageIndex;
	}

	public int getPageIndex() {
		return pageIndex;
	}
}
