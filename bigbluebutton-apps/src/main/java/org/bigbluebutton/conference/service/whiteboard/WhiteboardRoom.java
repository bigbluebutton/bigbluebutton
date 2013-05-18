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
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

import org.bigbluebutton.conference.service.whiteboard.shapes.Annotation;

public class WhiteboardRoom {
	private ArrayList<Presentation> presentations;
	private final String id;
	private Presentation activePresentation;
	private boolean whiteboardEnabled = false;
	private boolean record = false;
	private final UIDGenerator uidGen;
	private final Map<String, IWhiteboardRoomListener> listeners;
	
	public WhiteboardRoom(String id, boolean record){
		this.record = record;
		this.id = id;
		this.presentations = new ArrayList<Presentation>();
		listeners = new ConcurrentHashMap<String, IWhiteboardRoomListener>();
		uidGen = new UIDGenerator();
	}
	
	public String getId() {
		return id;
	}

	public void record(boolean record) {
		this.record = record;
	}

	public boolean isRecorded() {
		return record;
	}
	
	/**
		Get the id of the current presentation.
	 */
	public String getPresentationID() {
		return activePresentation.getName();
	}

	public int getPageNumber() {
		return activePresentation.getActivePage().getPageIndex();
	}

	/**
	 * Add a new presentation. Will also set the activePresentation
	 * @param name
	 * @param numPages
	 */
	public void addPresentation(String name, int numPages) {
		activePresentation = new Presentation(name, numPages);
		presentations.add(activePresentation);
	}
	
	private Presentation getPresentation(String name) {
		for (int  i = 0; i < presentations.size(); i++){
			Presentation pres = presentations.get(i);
			if (pres.getName().equals(name)) return pres;
		}
		return null;
	}
	
	public Presentation getActivePresentation() {
		return activePresentation;
	}
	
	public void setActivePresentation(String name) {
		Presentation p = getPresentation(name);
		if (p != null) {
			this.activePresentation = p;
		}		
	}
	
	public boolean presentationExists(String name) {
		boolean exists = false;
		for (int i = 0; i < presentations.size(); i++) {
			if (presentations.get(i).getName().equals(name)) exists = true;
		}
		return exists;
	}
		
	public void addAnnotation(Annotation annotation) {
		activePresentation.getActivePage().addAnnotation(annotation);
		notifyAddShape(activePresentation, annotation);
	}
	
	public List<Annotation> getAnnotations(String presentationID, Integer pageNumber) {
		Presentation p = getPresentation(presentationID);
		if (p != null) {
			Page pg = p.getPage(pageNumber.intValue());
			if (pg != null) {
				return pg.getAnnotations();
			}
		}

		return new ArrayList<Annotation>();
	}
	
	public void modifyText(Annotation annotation) {
		activePresentation.getActivePage().modifyText(annotation.getID(), annotation);
		notifyModifyText(activePresentation, annotation);
	}
		
	public void clear() {
		activePresentation.getActivePage().clear();
		notifyClearPage(activePresentation);
	}
	
	public void undo() {
		activePresentation.getActivePage().undo();
		notifyUndoWBGraphic(activePresentation);
	}
	
	public void toggleGrid() {
		activePresentation.getActivePage().toggleGrid();
		notifyToggleGrid(activePresentation.getActivePage().isGrid(), activePresentation);
	}

	public void setWhiteboardEnabled(boolean whiteboardEnabled) {
		this.whiteboardEnabled = whiteboardEnabled;
	}

	public boolean isWhiteboardEnabled() {
		return whiteboardEnabled;
	}
	
	public void addRoomListener(IWhiteboardRoomListener listener) {
		if (! listeners.containsKey(listener.getName())) {
			listeners.put(listener.getName(), listener);			
		}
	}
	
	public void removeRoomListener(IWhiteboardRoomListener listener) {
		listeners.remove(listener);		
	}
	
	public void notifyAddShape(Presentation presentation, Annotation annotation){
		for (Iterator<IWhiteboardRoomListener> iter = listeners.values().iterator(); iter.hasNext();) {
			IWhiteboardRoomListener listener = (IWhiteboardRoomListener) iter.next();
			listener.addAnnotation(annotation, presentation);
		}
	}

	public void notifyUndoShape(Presentation presentation){
		for (Iterator<IWhiteboardRoomListener> iter = listeners.values().iterator(); iter.hasNext();) {
		}
}

	public void notifyAddText(Presentation presentation, Annotation text){
		for (Iterator<IWhiteboardRoomListener> iter = listeners.values().iterator(); iter.hasNext();) {
			IWhiteboardRoomListener listener = (IWhiteboardRoomListener) iter.next();
			listener.addText(text, presentation);
		}
	}
	
	public void notifyModifyText(Presentation presentation, Annotation text){
		for (Iterator<IWhiteboardRoomListener> iter = listeners.values().iterator(); iter.hasNext();) {
			IWhiteboardRoomListener listener = (IWhiteboardRoomListener) iter.next();
			listener.modifyText(text, presentation);
		}
	}
	
	public void notifyUndoWBGraphic(Presentation presentation){
		for (Iterator<IWhiteboardRoomListener> iter = listeners.values().iterator(); iter.hasNext();) {
			IWhiteboardRoomListener listener = (IWhiteboardRoomListener) iter.next();
			listener.undoWBGraphic(presentation);
		}
	}
	
	public void notifyToggleGrid(boolean enabled, Presentation presentation){
		for (Iterator<IWhiteboardRoomListener> iter = listeners.values().iterator(); iter.hasNext();) {
			IWhiteboardRoomListener listener = (IWhiteboardRoomListener) iter.next();
			listener.toggleGrid(enabled, presentation);
		}
	}
	
	public void notifyClearPage(Presentation presentation){
		for (Iterator<IWhiteboardRoomListener> iter = listeners.values().iterator(); iter.hasNext();) {
			IWhiteboardRoomListener listener = (IWhiteboardRoomListener) iter.next();
			listener.clearPage(presentation);
		}
	}
		
	public int getUniqueWBGraphicIdentifier() {
		return uidGen.generateUID();
	}

}
