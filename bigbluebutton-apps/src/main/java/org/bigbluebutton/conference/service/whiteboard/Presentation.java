package org.bigbluebutton.conference.service.whiteboard;

import java.util.ArrayList;

public class Presentation {
	
	private String name;
	private ArrayList<Page> pages;
	
	private Page activePage;
	private int activePageIndex;
	
	public Presentation(String name, int numPages){
		this.name = name;
		this.pages = new ArrayList<Page>(numPages);
		for (int i=0; i<numPages; i++){
			pages.add(new Page());
		}
		this.activePage = pages.get(0);
		this.activePageIndex = 0;
	}
	
	public String getName(){
		return name;
	}
	
	public Page getActivePage(){
		return activePage;
	}
	
	public void setActivePage(int index){
		if ((index > pages.size()) || (index == activePageIndex)) return;
		
		activePage = pages.get(index);
		activePageIndex = index;
	}
	
}
