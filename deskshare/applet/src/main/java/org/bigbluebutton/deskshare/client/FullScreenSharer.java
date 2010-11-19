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
package org.bigbluebutton.deskshare.client;

public class FullScreenSharer implements ScreenSharer {

	private final ScreenShareInfo ssi;
	private ScreenSharerRunner sharer;
	private ClientListener listener;
	
	public FullScreenSharer(ScreenShareInfo ssi) {
		this.ssi = ssi;
	}
	
	public void start() {
		sharer = new ScreenSharerRunner(ssi);
		sharer.addClientListener(listener);
		sharer.startSharing();
	}
	
	public void addClientListener(ClientListener l) {
		listener = l;
	}
	
	/*****************************************************************************
    ;  disconnected
    ;----------------------------------------------------------------------------
	; DESCRIPTION
	;   This routine is used to pop up the dialog box and change icon try 
	;   message when client is disconnected from the server.
	;
	; RETURNS : N/A
	;
	; INTERFACE NOTES
	; 
	;       INPUT : N/A
	; 
	;       OUTPUT : N/A
	; 
	; IMPLEMENTATION
	;
	; HISTORY
	; __date__ :        PTS:  
	; 2010.11.19		problem 272
	;
	******************************************************************************/
	public void disconnected(){
		sharer.disconnectSharing();
	} // END FUNCTION disconnected
	
	public void stop() {
		sharer.stopSharing();
	}
}
