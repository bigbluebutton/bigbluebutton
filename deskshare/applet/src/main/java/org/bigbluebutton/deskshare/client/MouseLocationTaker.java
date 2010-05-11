package org.bigbluebutton.deskshare.client;

import java.awt.HeadlessException;
import java.awt.MouseInfo;
import java.awt.Point;
import java.awt.PointerInfo;

public class MouseLocationTaker {
	
	public Point getMouseLocation() {
		PointerInfo pInfo;
		try {
			pInfo = MouseInfo.getPointerInfo();
		} catch (HeadlessException e) {
			pInfo = null;
		} catch (SecurityException e) {
			pInfo = null;
		}
		
		if (pInfo == null) return new Point(0,0);
		
		return pInfo.getLocation();		
	}
}
