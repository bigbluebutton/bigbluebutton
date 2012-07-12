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
 * Author: Felipe Cecagno <felipe@mconf.org>
 */
package org.bigbluebutton.conference.service.layout;

import java.util.List;

import org.red5.logging.Red5LoggerFactory;
import org.red5.server.api.so.ISharedObject;
import org.red5.server.api.statistics.ISharedObjectStatistics;
import org.slf4j.Logger;

public class LayoutSender implements ILayoutRoomListener {

private static Logger log = Red5LoggerFactory.getLogger( LayoutSender.class, "bigbluebutton" );
	
	private ISharedObject so;
	private String name = "LAYOUT";
	
	public LayoutSender(ISharedObject so) {
		this.so = so; 
	}

	@Override
	public String getName() {
		return name;
	}

	@Override
	public void updateLayout(List<Object> args) {
		log.debug("Sending update layout");
		
		if (so.isLocked()) log.info("Layout SO is locked");
		if (so.isAcquired()) log.info("Layout SO is acquired");
		ISharedObjectStatistics stats = so.getStatistics();
		log.debug("Before: Layout SO stats [total-sends=" + stats.getTotalSends() + "]");
		so.sendMessage("remoteUpdateLayout", args);
		log.debug("After: Layout SO stats [total-sends=" + stats.getTotalSends() + "]");
		if (so.isLocked()) log.info("Layout SO is locked");
		if (so.isAcquired()) log.info("Layout SO is acquired");
	}

}
