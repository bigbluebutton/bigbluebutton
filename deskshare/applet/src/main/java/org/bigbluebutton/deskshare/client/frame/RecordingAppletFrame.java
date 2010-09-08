/*
 * BigBlueButton - http://www.bigbluebutton.org
 * 
 * Copyright (c) 2008-2010 by respective authors (see below). All rights reserved.
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
 * @author Jeremy Thomerson <jthomerson@genericconf.com>
 * $Id: $
 */
package org.bigbluebutton.deskshare.client.frame;

import java.awt.AWTException;
import java.awt.Button;
import java.awt.FlowLayout;
import java.awt.Robot;
import java.awt.event.ActionEvent;
import java.awt.event.ActionListener;
import java.awt.event.MouseAdapter;
import java.awt.image.BufferedImage;
import java.io.File;
import java.io.IOException;

import javax.imageio.ImageIO;
import javax.swing.JPanel;

import org.bigbluebutton.deskshare.client.DeskShareApplet;

public class RecordingAppletFrame extends WindowlessFrame {
	private static final long serialVersionUID = 1L;

	private final Robot mRobot;
	private DeskShareApplet applet;
	public Button btnStartStop;

	public RecordingAppletFrame(int borderWidth) {
		super(borderWidth);
		setToolbar(createToolbar());

		try {
			mRobot = new Robot();
		} catch(AWTException ex) {
			throw new RuntimeException("could not initialize the robot: " + ex.getMessage(), ex);
		}
	}
	
	private JPanel createToolbar() {
		final JPanel panel = new JPanel();
		panel.setLayout(new FlowLayout());
		//final Button move = new Button("Move frame");
		final MouseAdapter moving = createMovingMouseListener();
		//move.addMouseListener(moving);
		//move.addMouseMotionListener(moving);
		//panel.add(move);
		btnStartStop = new Button("Start Capture");
		btnStartStop.addActionListener(new ActionListener() {
			@Override
			public void actionPerformed(ActionEvent e) {
				//captureSelectedArea();
				startCapture();
			}
		});
		panel.add(btnStartStop);
		//panel.setSize();
		return panel;
	}

	public final void captureSelectedArea() {
		final BufferedImage image = mRobot.createScreenCapture(getFramedRectangle());
		try {
		    File outputfile = File.createTempFile("screencap-", ".png");
		    ImageIO.write(image, "png", outputfile);
		    System.out.println("selected area captured to: " + outputfile.getAbsolutePath());
		} catch (IOException ioe) {
			throw new RuntimeException("could not capture selected area as an image: " + ioe.getMessage(), ioe);
		}
	}
	
	public final void startCapture(){
		if (!applet.isSharing){
			applet.setDimensions(getX(), getY(), getWidth(), getHeight());
			applet.startSharing();
		} else{
			applet.stop();
			applet.destroy();
			System.exit(0); //Can't find any other way to close the applet.
		}
		
	}
	
	public void setApplet(DeskShareApplet applet){
		this.applet = applet;
	}

	public static void main(String[] args) {
		/*
		final JFrame frame = new JFrame("test");
		frame.setContentPane(createToolbar());
		frame.pack();
		frame.setVisible(true);
		*/
		final RecordingAppletFrame raf = new RecordingAppletFrame(5);
		raf.setHeight(300);
		raf.setWidth(600);
		raf.centerOnScreen();
		raf.setVisible(true);
	}
}
