/*
 * BigBlueButton - http://www.bigbluebutton.org
 * 
 * Copyright (c) 2008-2009 by respective authors (see below). All rights reserved.
 * 
 * BigBlueButton is free software; you can redistribute it and/or modify it under the 
 * terms of the GNU Lesser General Public License as published by the Free Software 
 * Foundation; either version 3 of the License, or (at your option) any later 
 * version. 
 * 
 * BigBlueButton is distributed in the hope that it will be useful, but WITHOUT ANY 
 * WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A 
 * PARTICULAR PURPOSE. See the GNU Lesser General Public License for more details.
 * 
 * You should have received a copy of the GNU Lesser General Public License along 
 * with BigBlueButton; if not, If not, see <http://www.gnu.org/licenses/>.
 *
 * $Id: $
 */
package org.bigbluebutton.deskshare.client;

import java.awt.AWTException;
import java.awt.Rectangle;
import java.awt.Robot;
import java.awt.Toolkit;
import java.awt.image.BufferedImage;

/**
 * The Capture class uses the java Robot class to capture the screen
 * The image captured is scaled down. This is done because of bandwidth issues and because it
 * is unnecessary for the Flex Client to be able to see the full screen, in fact it is undesirable
 * to do so.
 * The image can then be sent for further processing
 * @author Snap
 *
 */
public class ScreenCapture {	
	private Robot robot;
	private Toolkit toolkit;
	private Rectangle screenBounds;	
	private int width, height, x,y, videoWidth, videoHeight;

	public ScreenCapture(int x, int y, int screenWidth, int screenHeight){
		this.width = screenWidth;
		this.height = screenHeight;
		try{
			robot = new Robot();
		}catch (AWTException e){
			System.out.println(e.getMessage());
		}
		this.toolkit = Toolkit.getDefaultToolkit();
		this.screenBounds = new Rectangle(x, y, this.width, this.height);
	}
	
	public BufferedImage takeSingleSnapshot(){
		return robot.createScreenCapture(this.screenBounds);
	}
	
	public int getScreenshotWidth(){
		return toolkit.getScreenSize().width;
	}
	
	public int getScreenshotHeight(){
		return toolkit.getScreenSize().height;
	}
	
	public void setWidth(int width){
		int screenWidth = toolkit.getScreenSize().width;
		if (width > screenWidth) this.width = screenWidth;
		else this.width = width;
		updateBounds();
	}
	
	public void setHeight(int height){
		int screenHeight = toolkit.getScreenSize().height;
		if (height > screenHeight) {
			this.height = screenHeight;
		}
		else {
			this.height = height;
		}
		updateBounds();
	}
	
	public void setX(int x){
		this.x = x;
		updateBounds();
	}
	
	public void setY(int y){
		this.y = y;
		updateBounds();
	}
	
	public void updateBounds(){
		this.screenBounds = new Rectangle(x,y,width,height);
	}
	
	 public int getWidth(){
		 return this.width;
	 }
	 
	 public int getHeight(){
		 return this.height;
	 }
	 
	 public int getProperFrameRate(){
		 long area = width*height;
		 if (area > 1000000) return 1;
		 else if (area > 600000) return 2;
		 else if (area > 300000) return 4;
		 else if (area > 150000) return 8;
		 else return 10;
	 }
	 	 
	 public int getVideoWidth(){
		 return videoWidth;
	 }
	 
	 public int getVideoHeight(){
		 return videoHeight;
	 }

}
