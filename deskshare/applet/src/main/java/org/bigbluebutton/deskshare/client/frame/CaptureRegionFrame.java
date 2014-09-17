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
package org.bigbluebutton.deskshare.client.frame;

import java.awt.Button;
import java.awt.Color;
import java.awt.Dimension;
import java.awt.FlowLayout;
import java.awt.Graphics;
import java.awt.GridBagLayout;
import java.awt.Rectangle;
import java.awt.event.ActionEvent;
import java.awt.event.ActionListener;
import java.awt.image.BufferedImage;
import java.io.IOException;

import javax.imageio.ImageIO;
import javax.swing.BorderFactory;
import javax.swing.ImageIcon;
import javax.swing.JLabel;
import javax.swing.JPanel;

public class CaptureRegionFrame {
	private Button btnStartStop;
	private CaptureRegionListener client;
	private boolean capturing = false;
	private WindowlessFrame frame;
	private static final int RESIZE_BAR_SIZE = 40;
	private static final int MOVE_BAR_SIZE = 60;

	public CaptureRegionFrame(CaptureRegionListener client, int borderWidth) {
		frame = new WindowlessFrame(borderWidth);
		this.client = client;
		frame.setCaptureRegionListener(client);
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

	public void start(boolean autoStart) {
		frame.setToolbar(createToolbar());
		frame.setResizeBar(createResizeBar());
		frame.setMoveBar(createMoveBar());
		setVisible(true);
		if (autoStart) {
			startCapture();	
		} 
	}

	private JPanel createResizeBar(){
		final JPanel resizePanel = new JPanel();
		resizePanel.setPreferredSize(new Dimension(RESIZE_BAR_SIZE,RESIZE_BAR_SIZE));
		resizePanel.setBorder(BorderFactory.createLineBorder(Color.RED));
		resizePanel.setLayout(new GridBagLayout());
		BufferedImage resizeCursorImage = null;

		try {
			// Image was taken from http://4.bp.blogspot.com/_fhb-4UuRH50/R1ZLryoIvJI/AAAAAAAAA6U/G3S-XYabULk/s1600/se-resize.gif
			resizeCursorImage = ImageIO.read(getClass().getResourceAsStream("/images/resize-cursor.png"));
		} catch (IOException e) {
			e.printStackTrace();
		}

		JLabel resizePicLabel = new JLabel(new ImageIcon(resizeCursorImage));
		resizePanel.add(resizePicLabel);
		return resizePanel;
	}

	private JPanel createMoveBar() {
		final CirclePanel movePanel = new CirclePanel();
		movePanel.setPreferredSize(new Dimension(MOVE_BAR_SIZE,MOVE_BAR_SIZE));
		movePanel.setLayout(new GridBagLayout());
		BufferedImage moveCursorImage = null;

		try {
			// Image was taken from http://www.iconarchive.com/show/oxygen-icons-by-oxygen-icons.org/Actions-transform-move-icon.html
			moveCursorImage = ImageIO.read(getClass().getResourceAsStream("/images/move-cursor.png"));
		} catch (IOException e) {
			e.printStackTrace();
		}

		JLabel movePicLabel = new JLabel(new ImageIcon(moveCursorImage));
		movePanel.add(movePicLabel);
		return movePanel;
	}

	// Wrap move panel in a circle
	public class CirclePanel extends JPanel {
		static final long serialVersionUID = 1L;

		@Override
		protected void paintComponent(Graphics g) {
			g.drawOval(0, 0, g.getClipBounds().width, g.getClipBounds().height);
		}
	}

	private JPanel createToolbar() {
		final JPanel panel = new JPanel();
		panel.setBackground(Color.RED); 
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
