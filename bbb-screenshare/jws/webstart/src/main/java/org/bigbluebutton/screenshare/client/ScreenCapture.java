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
package org.bigbluebutton.screenshare.client;

import java.awt.AWTException;
import java.awt.Graphics2D;
import java.awt.HeadlessException;
import java.awt.Image;
import java.awt.MouseInfo;
import java.awt.Point;
import java.awt.PointerInfo;
import java.awt.Rectangle;
import java.awt.Robot;
import java.awt.image.BufferedImage;
import java.io.IOException;

import javax.imageio.ImageIO;

/**
 * The Capture class uses the java Robot class to capture the screen.
 * @author Snap
 *
 */
public class ScreenCapture {	
  private Robot robot;
  private Rectangle screenBounds;	
  private int scaleWidth, scaleHeight, x, y, captureWidth, captureHeight;
  private Point curMouseLocation = new Point(Integer.MIN_VALUE, Integer.MIN_VALUE);

  private Image cursor;
  
  public ScreenCapture(int x, int y, int captureWidth, int captureHeight, int scaleWidth, int scaleHeight) {
    this.x = x;
    this.y = y;
    this.captureWidth = captureWidth;
    this.captureHeight = captureHeight;

    try{
      robot = new Robot();
    }catch (AWTException e){
      System.out.println(e.getMessage());
    }

    this.screenBounds = new Rectangle(x, y, this.captureWidth, this.captureHeight);
    this.scaleWidth = scaleWidth;
    this.scaleHeight = scaleHeight;
 
    try {
      cursor = ImageIO.read(getClass().getResourceAsStream("/images/Cursor.png"));
    } catch (IOException e) {
      // TODO Auto-generated catch block
      e.printStackTrace();
    }
  }

  public BufferedImage takeSingleSnapshot() {
    BufferedImage capturedImage = robot.createScreenCapture(this.screenBounds);

//    System.out.println("ScreenCapture snap: [cw=" + captureWidth + ",ch=" + captureHeight + "] at [x=" + x + ",y=" + y +"]"
//    				+ "[sw==" + scaleWidth + ",sh=" + scaleHeight + "]");
   
    BufferedImage currentScreenshot = new BufferedImage(capturedImage.getWidth(), capturedImage.getHeight(), BufferedImage.TYPE_3BYTE_BGR);
    currentScreenshot.getGraphics().drawImage(capturedImage, 0, 0, null);

    Point mouseLoc = takeMouseLocation(); 
    int x = mouseLoc.x;
    int y = mouseLoc.y;

    Graphics2D graphics2D = currentScreenshot.createGraphics();
    graphics2D.drawImage(cursor, x, y, 16, 16, null); // cursor.gif is 16x16 size.
    
    return currentScreenshot;
  }

  public void setX(int x) {
    this.x = x;
    updateBounds();
  }

  public void setY(int y) {
    this.y = y;
    updateBounds();
  }

  public void setWidth(int width) {
    this.captureWidth = width;
    updateBounds();
  }

  public void setHeight(int height) {
    this.captureHeight = height;
    updateBounds();
  }

  public void updateBounds() {
    this.screenBounds = new Rectangle(x, y, captureWidth, captureHeight);
  }
 
  private Point getMouseLocation() {
    PointerInfo pInfo;
    Point pointerLocation = new Point(0,0);

    try {
      pInfo = MouseInfo.getPointerInfo();
    } catch (HeadlessException e) {
      pInfo = null;
    } catch (SecurityException e) {
      pInfo = null;
    }

    if (pInfo == null) return pointerLocation;

    return pInfo.getLocation();     
  }

  private Point calculatePointerLocation(Point p) {
    //      System.out.println("Mouse Tracker:: Image=[" + captureWidth + "," + captureHeight + "] scale=[" + scaleWidth + "," + scaleHeight + "]");

    int mouseXInCapturedRegion = p.x - x;
    int mouseYInCapturedRegion = p.y - y;

    double scaledMouseX = mouseXInCapturedRegion * (double)((double)scaleWidth  / (double)captureWidth);
    double scaledMouseY = mouseYInCapturedRegion * (double)((double)scaleHeight  / (double)captureHeight);

    return new Point((int)scaledMouseX, (int)scaledMouseY);
  }

  private Point takeMouseLocation() {      
    Point mouseLocation = getMouseLocation();
    if (isMouseInsideCapturedRegion(mouseLocation)) {
      //            System.out.println("Mouse is inside captured region [" + mouseLocation.x + "," + mouseLocation.y + "]");
      curMouseLocation = calculatePointerLocation(mouseLocation);
    }
    
    return curMouseLocation;
  }

  private boolean isMouseInsideCapturedRegion(Point p) {
    return true;
    //      return ( ( (p.x > captureX) && (p.x < (captureX + captureWidth) ) ) 
    //              && (p.y > captureY && p.y < captureY + captureHeight));
  }
}
