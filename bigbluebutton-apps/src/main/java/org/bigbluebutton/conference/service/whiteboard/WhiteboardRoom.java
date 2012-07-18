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
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

import org.bigbluebutton.conference.service.chat.IChatRoomListener;
import org.red5.compatibility.flex.messaging.io.ArrayCollection;
import org.red5.server.api.IScope;

public class WhiteboardRoom {
	
	private IScope scope;
	private ArrayList<Presentation> presentations;
	
	private Presentation activePresentation;
	private boolean whiteboardEnabled = false;
	
	private final UIDGenerator uidGen;
	private final Map<String, IWhiteboardRoomListener> listeners;
	
	public WhiteboardRoom(IScope scope){
		this.scope = scope;
		this.presentations = new ArrayList<Presentation>();
		listeners = new ConcurrentHashMap<String, IWhiteboardRoomListener>();
		uidGen = new UIDGenerator();
	}
	
	public IScope getScope(){
		return this.scope;
	}
	
	/**
	 * Add a new presentation. Will also set the activePresentation
	 * @param name
	 * @param numPages
	 */
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
	
	public void addShape(ShapeGraphic shape){
		activePresentation.getActivePage().addShapeGraphic(shape);
		notifyAddShape(activePresentation, shape);
	}
	
	public void addText(TextGraphic text){
		activePresentation.getActivePage().addTextGraphic(text);
		notifyAddText(activePresentation, text);
	}
	
	public void modifyText(TextGraphic text){
		activePresentation.getActivePage().modifyTextGraphic(text);
		notifyModifyText(activePresentation, text);
	}
	
	public List<Object[]> getHistory(){
		return activePresentation.getActivePage().getHistory();
	}
	
	public void clear(){
		activePresentation.getActivePage().clear();
		notifyClearPage(activePresentation);
	}
	
	public void undo(){
		activePresentation.getActivePage().undo();
		notifyUndoWBGraphic(activePresentation);
	}
	
	public void toggleGrid(){
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
	
	public void notifyAddShape(Presentation presentation, ShapeGraphic shape){
		for (Iterator iter = listeners.values().iterator(); iter.hasNext();) {
			IWhiteboardRoomListener listener = (IWhiteboardRoomListener) iter.next();
			listener.addShape(shape, presentation);
		}
	}
	
	public void notifyAddText(Presentation presentation, TextGraphic text){
		for (Iterator iter = listeners.values().iterator(); iter.hasNext();) {
			IWhiteboardRoomListener listener = (IWhiteboardRoomListener) iter.next();
			listener.addText(text, presentation);
		}
	}
	
	public void notifyModifyText(Presentation presentation, TextGraphic text){
		for (Iterator iter = listeners.values().iterator(); iter.hasNext();) {
			IWhiteboardRoomListener listener = (IWhiteboardRoomListener) iter.next();
			listener.modifyText(text, presentation);
		}
	}
	
	public void notifyUndoWBGraphic(Presentation presentation){
		for (Iterator iter = listeners.values().iterator(); iter.hasNext();) {
			IWhiteboardRoomListener listener = (IWhiteboardRoomListener) iter.next();
			listener.undoWBGraphic(presentation);
		}
	}
	
	public void notifyToggleGrid(boolean enabled, Presentation presentation){
		for (Iterator iter = listeners.values().iterator(); iter.hasNext();) {
			IWhiteboardRoomListener listener = (IWhiteboardRoomListener) iter.next();
			listener.toggleGrid(enabled, presentation);
		}
	}
	
	public void notifyClearPage(Presentation presentation){
		for (Iterator iter = listeners.values().iterator(); iter.hasNext();) {
			IWhiteboardRoomListener listener = (IWhiteboardRoomListener) iter.next();
			listener.clearPage(presentation);
		}
	}
	
	public Map<String, WBGraphic> getWBGraphicMap(){
		return activePresentation.getActivePage().getWBGraphicMap();
	}
	
	public int getUniqueWBGraphicIdentifier() {
		return uidGen.generateUID();
	}

}
