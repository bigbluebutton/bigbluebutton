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
package org.bigbluebutton.deskshare.client;

public enum ExitCode {
	NORMAL(0),
	BAD_PARAMETERS(400),
	CANNOT_CONNECT_TO_LIFELINE(401),
	ERROR_ON_LIFELINE_CONNECTION(402),
	CONNECTION_TO_DESKSHARE_SERVER_DROPPED(403), 
	CANNOT_BIND_TO_LIFELINE_PORT(404),
	LIFELINE_CONNECTION_CLOSED(405),
	INTERNAL_ERROR(500), 
	DESKSHARE_SERVICE_UNAVAILABLE(503);
	
	private final int exitValue;
	
	ExitCode(int code) { this.exitValue = code; }
	
	public int getExitCode() {return exitValue;}
}
