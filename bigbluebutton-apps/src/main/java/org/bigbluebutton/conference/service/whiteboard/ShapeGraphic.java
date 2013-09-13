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


import org.red5.compatibility.flex.messaging.io.ArrayCollection;

public class ShapeGraphic extends WBGraphic {
	
	private String type;
	private int thickness;
	private int color;
	private int fillColor;
	
	private boolean fill;
	private boolean transparent;	
	
	private double[] shape;
	
	public static final String PENCIL = "pencil";
	public static final String RECTANGLE = "rectangle";
	public static final String ELLIPSE = "ellipse";
	public static final String TEXT = "text";
	public static final String TRIANGLE = "triangle";
	public static final String HIGHLIGHTER = "highlighter";
	public static final String ERASER = "eraser";
	public static final String LINE = "line";
	
	public ShapeGraphic(double[] shape, String type, int color, int thickness, boolean fill, int fillColor, boolean transparent, String id, String status){
		super(WBGraphic.Type.SHAPE);
		this.shape = shape;
		this.type = type;
		this.color = color;
		this.thickness = thickness;
		this.fill = fill;
		this.fillColor = fillColor;
		this.transparent = transparent;
		this.ID = id;
		this.status = status;
	}
	
	@Override
	public ArrayCollection<Object> toList(){
		ArrayCollection<Object> sendableList = new ArrayCollection<Object>();
		sendableList.add(graphicType);
		sendableList.add(shape);
		sendableList.add(type);
		sendableList.add(color);
		sendableList.add(thickness);
		sendableList.add(fill);
		sendableList.add(fillColor);
		sendableList.add(transparent);
		sendableList.add(ID);
		sendableList.add(status);
		return sendableList;
	}
	
	@Override
	public Object[] toObjectArray(){
		Object[] objects = new Object[10];
		objects[0] = graphicType;
		objects[1] = shape;
		objects[2] = type;
		objects[3] = color;
		objects[4] = thickness;
		objects[5] = fill;
		objects[6] = fillColor;
		objects[7] = transparent;
		objects[8] = ID;
		objects[9] = status;
		return objects;
	}
		
	public String getShape(){
		String dataToString = "";
		for (int i=0; i<shape.length - 1; i++){
			dataToString += shape[i] + ",";
		}
		dataToString += shape[shape.length-1]; //We don't want a trailing comma
		return dataToString;
	}
	
	public String getType(){
		return type;
	}
	
	public int getColor(){
		return color;
	}
	
	public int getFillColor(){
		return fillColor;
	}
	
	public int getThickness(){
		return thickness;
	}

	public boolean isTransparent() {
		return transparent;
	}

	public boolean isFill() {
		return fill;
	}
}
