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
package org.bigbluebutton.conference.service.whiteboard;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import org.bigbluebutton.conference.service.whiteboard.shapes.Annotation;

public class Page {
	private ArrayList<Annotation> annotations;	
	private int pageIndex;
	private boolean isGrid = false;
	
	public Page(int pageIndex){
		annotations = new ArrayList<Annotation>();
		this.setPageIndex(pageIndex);
	}
		
	public void addAnnotation(Annotation annotation) {
		annotations.add(annotation);
	}
	
	public List<Annotation> getAnnotations() {
		List<Annotation> a = new ArrayList<Annotation>();
		for (Annotation v : annotations) {
			a.add(v);
		}
		
		return a;
	}
	
	public void deleteAnnotation(String id) {
		int foundIndex = findAnnotation(id);
		if (foundIndex >= 0) annotations.remove(foundIndex);
	}
	
	public void clear() {
		annotations.clear();
	}
	
	public void undo() {
		if (!annotations.isEmpty()) {
			annotations.remove(annotations.size() - 1);
		}
	}
	
	public int getNumShapesOnPage() {
		return annotations.size();
	}
		
	public void modifyText(String id, Annotation annotation){
		int foundIndex = findAnnotation(id);
		if (foundIndex >= 0) {			
			annotations.set(foundIndex, annotation);
		}
	}

	private int findAnnotation(String id) {
		int foundIndex = -1;
		for (int i=0; i < annotations.size(); i++) {
			Annotation annotation = annotations.get(i);
			if (annotation.getID().equals(id)) {
				foundIndex = i;
				break;
			}
		}
		return foundIndex;
		
	}
	
	public void toggleGrid() {
		System.out.println("Toggling grid mode on page " + pageIndex);
		isGrid = !isGrid;
	}
	
	public boolean isGrid() {
		return isGrid;
	}
	
	public void setPageIndex(int pageIndex) {
		this.pageIndex = pageIndex;
	}

	public int getPageIndex() {
		return pageIndex;
	}


}
