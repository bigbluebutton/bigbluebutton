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
package org.bigbluebutton.deskshare.client.frame;

import java.awt.Button;
import java.awt.FlowLayout;
import java.awt.Rectangle;
import java.awt.event.ActionEvent;
import java.awt.event.ActionListener;
import javax.swing.JPanel;

public class CaptureRegionFrame {
	private static final long serialVersionUID = 1L;

	private Button btnStartStop;
	private CaptureRegionListener client;
	private boolean capturing = false;
	private WindowlessFrame frame;
	
	public CaptureRegionFrame(CaptureRegionListener client, int borderWidth) {
		frame = new WindowlessFrame(borderWidth);
		this.client = client;
		frame.setCaptureRegionListener(client);
		frame.setToolbar(createToolbar());
	}
	
	public void setHeight(int h) {
		frame.setHeight(h);
	}
	
	public void setWidth(int w) {
		frame.setWidth(w);
	}
	
	public void setLocation(int x, int y) {
		frame.setLocation(x, y);
	}
	
	public void setVisible(boolean visible) {
		frame.setVisible(visible);	
	}
	
	
	private JPanel createToolbar() {
		final JPanel panel = new JPanel();
		panel.setLayout(new FlowLayout());
		capturing = false;
		btnStartStop = new Button("Start Sharing");
		btnStartStop.addActionListener(new ActionListener() {
			@Override
			public void actionPerformed(ActionEvent e) {
//				if (capturing) {
//					capturing = false;
//					btnStartStop.setLabel("Start Capture");
//					stopCapture();
//				} else {
//					capturing = true;
//					btnStartStop.setLabel("Stop Capture");
					startCapture();
//				}					
			}
		});
		panel.add(btnStartStop);
		return panel;
	}
	
	private void startCapture() {
		frame.changeBorderToBlue();
		frame.removeResizeListeners();
		Rectangle rect = frame.getFramedRectangle();
		client.onStartCapture(rect.x, rect.y, frame.getWidth(), frame.getHeight());
	}
	
	private void stopCapture() {		
		frame.changeBorderToRed();
		client.onStopCapture();
	}
}
