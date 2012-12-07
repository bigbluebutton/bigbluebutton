/**
 * BigBlueButton open source conferencing system - http://www.bigbluebutton.org/
 *
 * Copyright (c) 2012 BigBlueButton Inc. and by respective authors (see below).
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
 * Author: Ajay Gopinath <ajgopi124(at)gmail(dot)com>
 */
package org.bigbluebutton.conference.service.whiteboard;

import org.red5.compatibility.flex.messaging.io.ArrayCollection;

public class TextGraphic extends WBGraphic {

	private String text;
	private int textColor;
	private int bgColor;
	private boolean bgColorVisible;
	private int x;
	private int y;
	private int textSize;

	
	public TextGraphic() {
		super(WBGraphic.Type.TEXT);
	}

	public TextGraphic(String text, int textColor, int bgColor, boolean bgColorVisible, int x, int y, int textSize, String id, String status) {
		super(WBGraphic.Type.TEXT);
		this.text = text;
		this.textColor = textColor;
		this.bgColor = bgColor;
		this.bgColorVisible = bgColorVisible;
		this.x = x;
		this.y = y;
		this.textSize = textSize;
		this.ID = id;
		this.status = status;
	}

	@Override
	public ArrayCollection<Object> toList() {
		ArrayCollection<Object> sendableList = new ArrayCollection<Object>();
		sendableList.add(graphicType);
		sendableList.add(text);
		sendableList.add(textColor);
		sendableList.add(bgColor);
		sendableList.add(bgColorVisible);
		sendableList.add(x);
		sendableList.add(y);
		sendableList.add(textSize);
		sendableList.add(ID);
		sendableList.add(status);
		return sendableList;
	}

	@Override
	public Object[] toObjectArray() {
		Object[] objects = new Object[10];
		objects[0] = graphicType;
		objects[1] = text;
		objects[2] = textColor;
		objects[3] = bgColor;
		objects[4] = bgColorVisible;
		objects[5] = x;
		objects[6] = y;
		objects[7] = textSize;
		objects[8] = ID;
		objects[9] = status;
		return objects;
	}

	public String getText() {
		return text;
	}

	public int getTextColor() {
		return textColor;
	}

	public int getBgColor() {
		return bgColor;
	}

	public boolean getBgColorVisible() {
		return bgColorVisible;
	}

	public int getX() {
		return x;
	}

	public int getY() {
		return y;
	}
	
	public String getLocation() {
		return x + "," + y;
	}
	
	public int getTextSize() {
		return textSize;
	}

	public void setTextSize(int textSize) {
		this.textSize = textSize;
	}
}
