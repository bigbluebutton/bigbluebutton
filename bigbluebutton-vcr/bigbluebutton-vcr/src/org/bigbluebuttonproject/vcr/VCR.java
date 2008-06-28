/**
* BigBlueButton open source conferencing system - http://www.bigbluebutton.org/
*
* Copyright (c) 2008 by respective authors (see below).
*
* This program is free software; you can redistribute it and/or modify it under the
* terms of the GNU Lesser General Public License as published by the Free Software
* Foundation; either version 2.1 of the License, or (at your option) any later
* version.
*
* This program is distributed in the hope that it will be useful, but WITHOUT ANY
* WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A
* PARTICULAR PURPOSE. See the GNU Lesser General Public License for more details.
*
* You should have received a copy of the GNU Lesser General Public License along
* with this program; if not, write to the Free Software Foundation, Inc.,
* 59 Temple Place, Suite 330, Boston, MA 02111-1307 USA
* 
*/
package org.bigbluebuttonproject.vcr;

import java.io.FileOutputStream;

/**
 * A VCR acts as a client to the big blue button server. Via event streams it listens
 * to the events created by the server-side applications.
 * 
 * @author michael.r.weiss
 *
 */
public class VCR {

	protected String host = "present.carleton.ca";
	protected String room = "85001";
	protected String file = "lecture.xml";
	
	protected EventWriter out;
	
	public VCR(String[] args) {
		getArgs(args);
	}
	
	public static void main(String[] args) {
		VCR vcr = new VCR(args);
		vcr.startRecording();
	}

	public void getArgs(String[] args) {
		if (args.length >= 3) {
			host = args[0];
			room = args[1];
			file = args[2];
		}
	}
	
	public long getTimestamp() {
		return System.currentTimeMillis();
	}

	public void startRecording() {
		try {
			out = new EventWriter(new FileOutputStream(file));
			out.println("<lecture host=\"" + host + "\" room=\"" + room + 
					"\" start=\"" + getTimestamp() + "\">");
			out.println("<seq>");
			out.flush();
			
			ChatEventStream.debug = true;
			PresentationEventStream.debug = true;
			MeetMeEventStream.debug = true;
			
			EventStream chat = new ChatEventStream(host, room);
			chat.setWriter(out);
			
			EventStream presentation = new PresentationEventStream(host, room);
			presentation.setWriter(out);
			
			EventStream meetme = new MeetMeEventStream(host, room);
			meetme.setWriter(out);

			EventStream conference = new ConferenceEventStream(host, room);
			conference.setWriter(out);
		} catch (Exception e) {
			System.err.println("Something went wrong: " + e);
		}
	}
	
	public void stopRecording() {
		out.println("</seq>");
		out.println("</lecture>");
		out.flush();
	}
	
	public void finalize() {
		// TODO: this is not the appropriate place to do this
		// stopRecording();
	}
	
}
