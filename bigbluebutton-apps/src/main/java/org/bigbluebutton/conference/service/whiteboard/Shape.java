package org.bigbluebutton.conference.service.whiteboard;

import org.red5.compatibility.flex.messaging.io.ArrayCollection;

public class Shape {
	
	private String type;
	private int thickness;
	private int color;
	private double parentWidth;
	private double parentHeight;
	private double[] shape;
	
	public Shape(double[] shape, String type, int color, int thickness, double parentWidth, double parentHeight){
		this.shape = shape;
		this.type = type;
		this.color = color;
		this.thickness = thickness;
		this.parentWidth = parentWidth;
		this.parentHeight = parentHeight;
	}
	
	public ArrayCollection<Object> toList(){
		ArrayCollection<Object> sendableList = new ArrayCollection<Object>();
		sendableList.add(shape);
		sendableList.add(type);
		sendableList.add(color);
		sendableList.add(thickness);
		sendableList.add(parentWidth);
		sendableList.add(parentHeight);
		return sendableList;
	}
	
	public Object[] toObjectArray(){
		Object[] objects = new Object[6];
		objects[0] = shape;
		objects[1] = type;
		objects[2] = color;
		objects[3] = thickness;
		objects[4] = parentWidth;
		objects[5] = parentHeight;
		return objects;
	}
}
