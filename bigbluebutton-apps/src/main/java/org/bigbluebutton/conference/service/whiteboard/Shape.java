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


import org.red5.compatibility.flex.messaging.io.ArrayCollection;

public class Shape {
	
	private String type;
	private int thickness;
	private int color;
	private String id;
	private String status;
	
	private double[] shape;
	
	public static final String PENCIL = "pencil";
	public static final String RECTANGLE = "rectangle";
	public static final String ELLIPSE = "ellipse";
	
	public Shape(double[] shape, String type, int color, int thickness, String id, String status){
		this.shape = shape;
		this.type = type;
		this.color = color;
		this.thickness = thickness;
		this.id = id;
		this.status = status;
	}
	
	public ArrayCollection<Object> toList(){
		ArrayCollection<Object> sendableList = new ArrayCollection<Object>();
		sendableList.add(shape);
		sendableList.add(type);
		sendableList.add(color);
		sendableList.add(thickness);
		sendableList.add(id);
		sendableList.add(status);
		return sendableList;
	}
	
	public Object[] toObjectArray(){
		Object[] objects = new Object[10];
		objects[0] = shape;
		objects[1] = type;
		objects[2] = color;
		objects[3] = thickness;
		objects[4] = id;
		objects[5] = status;
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
	
	public int getThickness(){
		return thickness;
	}
}
