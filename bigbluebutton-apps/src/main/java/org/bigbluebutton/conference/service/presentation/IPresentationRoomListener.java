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

package org.bigbluebutton.conference.service.presentation;

import java.util.ArrayList;
import java.util.Map;

interface IPresentationRoomListener {
	public String getName();
	@SuppressWarnings("unchecked")
	public void sendUpdateMessage(Map message);
	@SuppressWarnings("unchecked")
	public void assignPresenter(ArrayList presenter);
	public void gotoSlide(int curslide);
	public void resizeAndMoveSlide(Long xOffset,Long yOffset,Long widthRatio,Long heightRatio);
	public void removePresentation(String name);
	public void sharePresentation(String presentationName, Boolean share);
}
