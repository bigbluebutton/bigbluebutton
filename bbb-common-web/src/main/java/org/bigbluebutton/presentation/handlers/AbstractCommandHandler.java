/**
 * BigBlueButton open source conferencing system - http://www.bigbluebutton.org/
 * 
 * Copyright (c) 2015 BigBlueButton Inc. and by respective authors (see below).
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
package org.bigbluebutton.presentation.handlers;

import java.nio.ByteBuffer;
import java.nio.CharBuffer;
import java.nio.charset.StandardCharsets;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.zaxxer.nuprocess.NuAbstractProcessHandler;
import com.zaxxer.nuprocess.NuProcess;

public abstract class AbstractCommandHandler extends
    NuAbstractProcessHandler {

  private static Logger log = LoggerFactory
      .getLogger(AbstractCommandHandler.class);

  protected NuProcess nuProcess;
  protected int exitCode;
  protected final StringBuilder stdoutBuilder = new StringBuilder();
  protected final StringBuilder stderrBuilder = new StringBuilder();

  @Override
  public void onPreStart(NuProcess nuProcess) {
    this.nuProcess = nuProcess;
  }

  @Override
  public void onStart(NuProcess nuProcess) {
    super.onStart(nuProcess);
  }

  @Override
  public void onStdout(ByteBuffer buffer, boolean closed) {
    if (buffer != null && buffer.remaining() > 0) {
      CharBuffer charBuffer = StandardCharsets.UTF_8.decode(buffer);
      String chunk = charBuffer.toString();
      stdoutBuilder.append(chunk);
      log.debug("[{}] {}", getIdTag(), chunk.trim());
    }
  }

  @Override
  public void onStderr(ByteBuffer buffer, boolean closed) {
    if (buffer != null) {
      CharBuffer charBuffer = StandardCharsets.UTF_8.decode(buffer);
      String chunk = charBuffer.toString();
      stderrBuilder.append(chunk);
      String trimmed = chunk.trim();
      if (!trimmed.isEmpty()) {
        log.error("[{}] {}", getIdTag(), trimmed);
      }
    }
  }

  @Override
  public void onExit(int statusCode) {
    exitCode = statusCode;
    log.debug("[{}] Process exited with code {}", getIdTag(), statusCode);
  }

  /**
   * 
   * @return true if the exit code of the process is different from 0
   */
  public Boolean exitedWithError() {
    return exitCode != 0;
  }

  protected Boolean stdoutContains(String value) {
    return stdoutBuilder.indexOf(value) > -1;
  }

  protected Boolean stdoutEquals(String value) {
    return stdoutBuilder.toString().trim().equals(value);
  }

  protected Boolean stderrContains(String value) {
    return stderrBuilder.indexOf(value) > -1;
  }

  public Boolean isCommandSuccessful() {
    return !exitedWithError();
  }

  public Boolean isCommandTimeout() {
    return exitCode == 124;
  }

  public String getStdout() {
    return stdoutBuilder.toString().trim();
  }

  public String getStdErr() {
    return stderrBuilder.toString().trim();
  }

  protected String getIdTag() {
    if (nuProcess != null) {
      return String.valueOf(nuProcess.getPID());
    } else {
      return "unknown-pid";
    }
  }
}
