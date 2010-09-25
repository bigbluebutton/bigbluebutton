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

import java.awt.Button;
import java.awt.FlowLayout;
import java.awt.event.ActionEvent;
import java.awt.event.ActionListener;
import javax.swing.JPanel;

import org.bigbluebutton.deskshare.client.DeskshareClient;

public class CaptureRegionFrame extends WindowlessFrame {
	private static final long serialVersionUID = 1L;

	private Button btnStartStop;
	private DeskshareClient client;
	
	public CaptureRegionFrame(DeskshareClient client, int borderWidth) {
		super(borderWidth);
		this.client = client;
		setToolbar(createToolbar());
	}
	
	private JPanel createToolbar() {
		final JPanel panel = new JPanel();
		panel.setLayout(new FlowLayout());
		btnStartStop = new Button("Start Capture");
		btnStartStop.addActionListener(new ActionListener() {
			@Override
			public void actionPerformed(ActionEvent e) {
				panel.remove(btnStartStop);
				startCapture();
			}
		});
		panel.add(btnStartStop);
		return panel;
	}
	
	private void startCapture() {
		client.start();
	}
}
