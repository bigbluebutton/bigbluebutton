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

import java.io.*;
import java.net.*;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.ArrayList;

import org.red5.server.net.rtmp.RTMPConnection;
import org.red5.server.net.rtmp.codec.RTMP;
import org.red5.server.api.IAttributeStore;
import org.red5.server.api.so.IClientSharedObject;
import org.red5.server.api.so.ISharedObjectBase;

/**
 * An event stream that listens for presentation events (advance to next slide, upload
 * a presentation, share a presentation, etc.).
 *
 * @author michael.r.weiss
 */
public class PresentationEventStream extends EventStream {
	
	protected IClientSharedObject presentationSO;

	protected boolean share = false;
	
	protected int userid;
	protected String name;
	protected String message;
	
	protected int completedSlides;
	protected int totalSlides;

	protected List<String> slides;
	
	public PresentationEventStream(String host, String room) {
		super(host, room);
	}
	
	public String getApplication() {
		return "presentation";
	}
	
	public void connectionOpened(RTMPConnection conn, RTMP state) {
		super.connectionOpened(conn, state);
		subscribeSharedObject(conn, "presentationSO");
	}
		    
	public void onSharedObjectSend(ISharedObjectBase so, String method, List params) {
		// System.out.println("Method on shared object sent: " + method);
		// System.out.println("Params on shared object sent: " + params);
		if (method.equals("newPageNumber")) {	
			int slide = ((Integer) params.get(0)).intValue() + 1;
			out.println("<slide time=\"" + getTimestamp() + "\">" + slide + "</slide>");
			out.flush();
		} 
	}

	public void onSharedObjectUpdate(ISharedObjectBase so, String key, Object value) {
		if (debug) {
			System.out.println("Update on shared object (Object): " + key + "{" + value + "}");
		}
		if (key.equals("sharing")) {
			Map<String, Object> values = (Map<String, Object>) value;
			share = ((Boolean) values.get("share")).booleanValue();
			out.println("<sharing time=\"" + getTimestamp() + 
				"\" share=\"" + share + "\"/>");
		} else if (key.equals("presenter")) {
			Map<String, Object> values = (Map<String, Object>) value;
			userid = ((Integer) values.get("userid")).intValue();
			name = (String) values.get("name");
			out.println("<presenter time=\"" + getTimestamp() + 
				"\" userid=\"" + userid + "\" name=\"" + name + "\"/>");
		} else if (key.equals("updateMessage")) {
			Map<String, Object> values = (Map<String, Object>) value;
			if (values.get("message") != null) {
				message = (String) values.get("message");
				slides = extractSlides(message);
				long time = getTimestamp();
				// execute the following in one block by protecting it
				// as a critical section (need to protect this block of code,
				// since all tags should be printed consecutively)
				out.acquireLock();
				try {
					out.println("<presentation time=\"" + time + "\">");
					for (Iterator<String> e = slides.iterator(); e.hasNext(); ) {
						String slide = e.next();
						out.println("<slide>" + slide + "</slide>");
					}
					out.println("</presentation>");
				} finally {
					out.releaseLock();
				}
				// download slides outside critical section
				for (Iterator<String> e = slides.iterator(); e.hasNext(); ) {
					String slide = e.next();
					downloadSlide(time, slide);
				}
			} else if (values.get("completedSlides") != null) {
				completedSlides = ((Integer) values.get("completedSlides")).intValue();
				totalSlides = ((Integer) values.get("totalSlides")).intValue();
				out.println("<conversion time=\"" + getTimestamp() + 
					"\" slide=\"" + completedSlides + 
					"\" total=\"" + totalSlides + "\"/>");
			}
		}
		out.flush();
	}
	
	protected void downloadSlide(long time, String slide) {
		OutputStream out = null;
		InputStream in = null;
		try {
			// TODO: this may change at some point in the future
			// refactor into a configuration variable
			URL url = new URL("http://" + host + 
				"/blindside/file/display?name=" + slide);
			new File("slides_" + time).mkdir();
			out = new BufferedOutputStream(
				new FileOutputStream("slides_" + time + "/" + slide));
			in = url.openConnection().getInputStream();
			byte[] buffer = new byte[512];
			int n;
			while ((n = in.read(buffer)) > -1) {
				out.write(buffer, 0, n);
			}
		} catch (Exception e) {
			System.err.println("Could not download slide " + slide + ": " + e);
		} finally {
			try {
				if (in != null) {
					in.close();
				}
				if (out != null) {
					out.close();
				}
			} catch (IOException e) { 
				// ignore
			}
		}
	}

	public void onSharedObjectUpdate(ISharedObjectBase so, IAttributeStore values) {
		if (debug) {
			System.out.println("Update on shared object (IAttributeStore): " + values);
		}
	}

	public void onSharedObjectUpdate(ISharedObjectBase so, Map<String, Object> values) {
		if (debug) {
			System.out.println("Update on shared object (Map): " + values);
		}
	}
	
	protected List<String> extractSlides(String message) {
		int i = message.indexOf("<name>");
		int j = message.indexOf("</name>");
		List<String> slides = new ArrayList<String>();
		while (i >= 0) {
			String slide = message.substring(i+6, j);
			slides.add(slide);
			i = message.indexOf("<name>", j+7);
			j = message.indexOf("</name>", j+7);
		}
		return slides;
	}
}