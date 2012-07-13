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
import java.util.Map;


public class Page {
	
	private ArrayList<Map<String, Object>> annotations;	
	private int pageIndex;
	
	public Page(int pageIndex){
		annotations = new ArrayList<Map<String, Object>>();

		this.setPageIndex(pageIndex);
	}
		
	public void addAnnotation(Map<String, Object> annotation) {
		annotations.add(annotation);
	}
	
	public List<Map<String, Object>> getAnnotations() {
		List<Map<String, Object>> a = new ArrayList<Map<String, Object>>();
		for (Map<String, Object> v : annotations) {
			a.add(v);
		}
		
		return a;
	}
	
	public void deleteAnnotation(String id) {
		int foundIndex = -1;
		for (int i=0; i < annotations.size(); i++) {
			Map<String, Object> annotation = annotations.get(i);
			if (annotation.get("id").equals(id)) {
				foundIndex = i;
				break;
			}
		}
		if (foundIndex >= 0) annotations.remove(foundIndex);
	}
	
	public void clear() {
		annotations.clear();
	}
	
	public void undo() {
		if (annotations.isEmpty()) {
			annotations.remove(annotations.size() - 1);
		}
	}
	
	public int getNumShapesOnPage() {
		return annotations.size();
	}

	public void setPageIndex(int pageIndex) {
		this.pageIndex = pageIndex;
	}

	public int getPageIndex() {
		return pageIndex;
	}
}
