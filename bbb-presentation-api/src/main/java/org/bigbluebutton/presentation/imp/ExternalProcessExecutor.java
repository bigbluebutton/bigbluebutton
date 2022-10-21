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

package org.bigbluebutton.presentation.imp;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.File;
import java.io.IOException;
import java.time.Duration;
import java.util.Arrays;
import java.util.List;
import java.util.concurrent.TimeUnit;

/**
 * A wrapper class the executes an external command.
 * 
 * @author Richard Alam
 * @author Marcel Hellkamp
 */
public class ExternalProcessExecutor {
	private static Logger log = LoggerFactory.getLogger(ExternalProcessExecutor.class);
	// Replace with ProcessBuilder.Redirect.DISCARD in java 9+
	private static File DISCARD = new File(
			System.getProperty("os.name").startsWith("Windows") ? "NUL" : "/dev/null");

	/**
	 * Run COMMAND for at most timeoutMillis while ignoring any output.
	 * 
	 * @deprecated The COMMAND string is split on whitespace to create an argument
	 *             list. This won't work for arguments that contain whitespace. Use
	 *             {@link #exec(List, Duration)} instead.
	 * 
	 * @param COMMAND       A single command or whitespace separated list of
	 *                      arguments.
	 * @param timeoutMillis Timeout in milliseconds.
	 * @return true if the command terminated in time with an exit value of 0.
	 */
	@Deprecated
	public boolean exec(String COMMAND, long timeoutMillis) {
		return exec(Arrays.asList(COMMAND.split("[ \\t\\n\\r\\f]+")), Duration.ofMillis(timeoutMillis));
	}

	/**
	 * Run a command for a limited amount of time while ignoring any output.
	 * 
	 * @param cmd     List containing the program and its arguments.
	 * @param timeout Maximum execution time.
	 * @return true if the command terminated in time with an exit value of 0.
	 */
	public boolean exec(List<String> cmd, Duration timeout) {

		ProcessBuilder pb = new ProcessBuilder(cmd);
		pb.redirectError(DISCARD);
		pb.redirectOutput(DISCARD);

		Process proc;
		try {
			proc = pb.start();
		} catch (IOException e) {
			log.error("Failed to execute: {}", String.join(" ", cmd), e);
			return false;
		}

		try {
			if (!proc.waitFor(timeout.toMillis(), TimeUnit.MILLISECONDS)) {
				log.warn("TIMEDOUT excuting: {}", String.join(" ", cmd));
				proc.destroy();
			}
			return !proc.isAlive() && proc.exitValue() == 0;
		} catch (InterruptedException e) {
			Thread.currentThread().interrupt();
			proc.destroy();
			return false;
		}
	}
}
