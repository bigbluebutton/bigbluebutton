package org.bigbluebutton.conference.service.whiteboard;

import java.util.ArrayList;
import java.util.List;

import org.red5.compatibility.flex.messaging.io.ArrayCollection;
import org.red5.server.api.IScope;

public class WhiteboardRoom {
	
	private IScope scope;
	private ArrayList<Presentation> presentations;
	
	private Presentation activePresentation;
	private boolean whiteboardEnabled = false;
	
	public WhiteboardRoom(IScope scope){
		this.scope = scope;
		this.presentations = new ArrayList<Presentation>();
	}
	
	public IScope getScope(){
		return this.scope;
	}
	
	public void addPresentation(String name, int numPages){
		activePresentation = new Presentation(name, numPages);
		presentations.add(activePresentation);
	}
	
	public Presentation getPresentation(String name){
		if (name.equals(activePresentation.getName())) return activePresentation;
		
		for (int i=0; i<presentations.size(); i++){
			Presentation pres = presentations.get(i);
			if (pres.getName().equals(name)) activePresentation = pres;
		}
		return activePresentation;
	}
	
	public Presentation getActivePresentation(){
		return activePresentation;
	}
	
	public void setActivePresentation(String name){
		this.activePresentation = getPresentation(name);
	}
	
	public boolean presentationExists(String name){
		boolean exists = false;
		for (int i=0; i<presentations.size(); i++){
			if (presentations.get(i).getName().equals(name)) exists = true;
		}
		return exists;
	}
	
	public void addShape(Shape shape){
		activePresentation.getActivePage().addShape(shape);
	}
	
	public List<Object[]> getShapes(){
		return activePresentation.getActivePage().getShapes();
	}
	
	public void clear(){
		activePresentation.getActivePage().clear();
	}
	
	public void undo(){
		activePresentation.getActivePage().undo();
	}

	public void setWhiteboardEnabled(boolean whiteboardEnabled) {
		this.whiteboardEnabled = whiteboardEnabled;
	}

	public boolean isWhiteboardEnabled() {
		return whiteboardEnabled;
	}
	
}
