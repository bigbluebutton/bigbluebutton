package org.bigbluebutton.conference.service.whiteboard;

import java.util.ArrayList;

import org.red5.compatibility.flex.messaging.io.ArrayCollection;

public class Shape {
	
	private String type;
	private int thickness;
	private int color;
	private double parentWidth;
	private double parentHeight;
	private double[] shape;
	
	public static final String PENCIL = "pencil";
	public static final String RECTANGLE = "rectangle";
	public static final String ELLIPSE = "ellipse";
	
	public Shape(double[] shape, String type, int color, int thickness, double parentWidth, double parentHeight){
		this.shape = shape;
		this.type = type;
		this.color = color;
		this.thickness = thickness;
		this.parentWidth = parentWidth;
		this.parentHeight = parentHeight;
		
		if(this.type.equalsIgnoreCase(PENCIL)) this.shape = optimizeFreeHand();
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
	
	private double[] optimizeFreeHand(){
		if (shape.length < 10) return shape; //Don't do any optimization for very small shapes
		
		ArrayList<Double> newShape = new ArrayList<Double>();
		
		double x1 = shape[0];
		double y1 = shape[1];
		newShape.add(x1);
		newShape.add(y1);
		double stableSlope = 0;
		double newSlope;
		double lastStableX = x1;
		double lastStableY = y1;
		boolean lineStable = false;

		for (int i=2; i<shape.length; i= i+2){
			double x2 = shape[i];
			double y2 = shape[i+1];
			
			newSlope = (y2 - y1)/(x2 - x1);
			//System.out.println("Slope change: " + (Math.abs(stableSlope / newSlope - 1)));
			if (slopeDifference(stableSlope, newSlope) < 5){
				lastStableX = x2;
				lastStableY = y2;
				lineStable = true;
			} else{
				stableSlope = newSlope;
				if (lineStable){
					lineStable = false;
					newShape.add(lastStableX);
					newShape.add(lastStableY);
				}
				x1 = x2;
				y1 = y2;
				newShape.add(x1);
				newShape.add(y1);
			}
		}
		newShape.add(shape[shape.length - 2]);
		newShape.add(shape[shape.length - 1]);
		
		double[] returnArray = new double[newShape.size()];
		for (int j= 0; j<newShape.size(); j++){
			returnArray[j] = newShape.get(j);
		}
		
		//System.out.println("Original: " + shape.length);
		//System.out.println("Optimized: " + returnArray.length);
		return returnArray;
	}
	
	private double slopeDifference(double oldSlope, double newSlope){
		double differenceInRad = Math.atan(oldSlope) - Math.atan(newSlope);
		//System.out.println(Math.abs(Math.toDegrees(differenceInRad)));
		return Math.abs(Math.toDegrees(differenceInRad));
	}
}
