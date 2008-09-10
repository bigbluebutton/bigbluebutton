package org.red5.server.net.servlet;

/*
 * RED5 Open Source Flash Server - http://www.osflash.org/red5
 * 
 * Copyright (c) 2006-2007 by respective authors (see below). All rights reserved.
 * 
 * This library is free software; you can redistribute it and/or modify it under the 
 * terms of the GNU Lesser General Public License as published by the Free Software 
 * Foundation; either version 2.1 of the License, or (at your option) any later 
 * version. 
 * 
 * This library is distributed in the hope that it will be useful, but WITHOUT ANY 
 * WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A 
 * PARTICULAR PURPOSE. See the GNU Lesser General Public License for more details.
 * 
 * You should have received a copy of the GNU Lesser General Public License along 
 * with this library; if not, write to the Free Software Foundation, Inc., 
 * 59 Temple Place, Suite 330, Boston, MA 02111-1307 USA 
 */

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

import javax.servlet.http.HttpServletRequest;

// TODO: Auto-generated Javadoc
/**
 * The Class ServletUtils.
 */
public class ServletUtils {

	/** Default value is 2048. */
	public static final int DEFAULT_BUFFER_SIZE = 2048;

	/**
	 * Copies information from the input stream to the output stream using a
	 * default buffer size of 2048 bytes.
	 * 
	 * @param input the input
	 * @param output the output
	 * 
	 * @throws java.io.IOException 	 * @throws IOException Signals that an I/O exception has occurred.
	 */
	public static void copy(InputStream input, OutputStream output)
			throws IOException {
		copy(input, output, DEFAULT_BUFFER_SIZE);
	}

	/**
	 * Copies information from the input stream to the output stream using the
	 * specified buffer size.
	 * 
	 * @param input the input
	 * @param bufferSize the buffer size
	 * @param output the output
	 * 
	 * @throws java.io.IOException 	 * @throws IOException Signals that an I/O exception has occurred.
	 */
	public static void copy(InputStream input, OutputStream output,
			int bufferSize) throws IOException {
		byte[] buf = new byte[bufferSize];
		int bytesRead = input.read(buf);
		while (bytesRead != -1) {
			output.write(buf, 0, bytesRead);
			bytesRead = input.read(buf);
		}
		output.flush();
	}

	/**
	 * Copies information between specified streams and then closes both of the
	 * streams.
	 * 
	 * @param output the output
	 * @param input the input
	 * 
	 * @throws java.io.IOException 	 * @throws IOException Signals that an I/O exception has occurred.
	 */
	public static void copyThenClose(InputStream input, OutputStream output)
			throws IOException {
		copy(input, output);
		input.close();
		output.close();
	}

	/**
	 * Gets the bytes.
	 * 
	 * @param input the input
	 * 
	 * @return a byte[] containing the information contained in the specified
	 * InputStream.
	 * 
	 * @throws java.io.IOException 	 * @throws IOException Signals that an I/O exception has occurred.
	 */
	public static byte[] getBytes(InputStream input) throws IOException {
		ByteArrayOutputStream result = new ByteArrayOutputStream();
		copy(input, result);
		result.close();
		return result.toByteArray();
	}

	/**
	 * Return all remote addresses that were involved in the passed request.
	 * 
	 * @param request the request
	 * 
	 * @return the remote addresses
	 */
	public static List<String> getRemoteAddresses(HttpServletRequest request) {
		List<String> addresses = new ArrayList<String>();
		addresses.add(request.getRemoteHost());
		if (!request.getRemoteAddr().equals(request.getRemoteHost())) {
			// Store both remote host and remote address 
			addresses.add(request.getRemoteAddr());
		}
		
		final String forwardedFor = request.getHeader("X-Forwarded-For");
		if (forwardedFor != null) {
			// Also store address this request was forwarded for.
			final String[] parts = forwardedFor.split(",");
			for (String part: parts) {
				addresses.add(part);
			}
		}
		
		final String httpVia = request.getHeader("Via");
		if (httpVia != null) {
			// Also store address this request was forwarded for.
			final String[] parts = httpVia.split(",");
			for (String part: parts) {
				addresses.add(part);
			}
		}
		
		return Collections.unmodifiableList(addresses);
	}
	
}
