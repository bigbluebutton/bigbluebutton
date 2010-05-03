package org.bigbluebutton.conference.service.whiteboard;

import java.util.ArrayList;
import java.util.List;

import org.red5.compatibility.flex.messaging.io.ArrayCollection;

public class Page {
	
	private ArrayCollection<Shape> shapes;
	
	public Page(){
		this.shapes = new ArrayCollection<Shape>();
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
		shapes.remove(shapes.size()-1);
	}
	
	public int getNumShapesOnPage(){
		return this.shapes.size();
	}
}
