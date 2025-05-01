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

import java.io.File;
import java.io.IOException;
import java.time.Duration;
import java.util.Arrays;
import java.util.List;
import java.util.concurrent.TimeUnit;

import com.zaxxer.nuprocess.NuProcess;
import com.zaxxer.nuprocess.NuProcessBuilder;
import org.bigbluebutton.presentation.handlers.ExternalProcessExecutorHandler;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

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
		ExternalProcessExecutorHandler pHandler = new ExternalProcessExecutorHandler();
		NuProcessBuilder pb = new NuProcessBuilder(cmd);
		pb.setProcessListener(pHandler);
		NuProcess process = pb.start();
		try {
			process.waitFor(timeout.toMillis(), TimeUnit.MILLISECONDS);
		} catch (InterruptedException e) {
			log.error("InterruptedException while executing {}", cmd, e);
		}

		if(pHandler.isCommandTimeout()) {
			log.error("Command execution ({}) exceeded the {} milliseconds timeout.",cmd, timeout.toMillis());
		}

		if(!pHandler.isCommandSuccessful()) {
			log.error("Command failed ({}): {}\n{}",
					pHandler.getExitCode(),
					String.join(" ", cmd),
                    !pHandler.getStderrString().isEmpty() ? pHandler.getStderrString().toString() : "(no stderr)");
		}

		return pHandler.isCommandSuccessful();
	}
}
