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

public class Presentation {
	
	private String name;
	private ArrayList<Page> pages;
	
	private Page activePage;
	
	public Presentation(String name, int numPages){
		this.name = name;
		this.pages = new ArrayList<Page>(numPages);
		for (int i=0; i<numPages; i++){
			pages.add(new Page(i));
		}
		this.activePage = pages.get(0);
	}
	
	public String getName(){
		return name;
	}
	
	public Page getActivePage(){
		return activePage;
	}
	
	public void setActivePage(int index){
		if ((index > pages.size()) || (index == activePage.getPageIndex())) return;
		
		activePage = pages.get(index);
	}
	
}
