/**
 * BigBlueButton open source conferencing system - http://www.bigbluebutton.org/
 * 
 * Copyright (c) 2017 BigBlueButton Inc. and by respective authors (see below).
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

import java.util.regex.Matcher;
import java.util.regex.Pattern;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class PdfPageCounterHandler extends AbstractCommandHandler {

  private static Logger log = LoggerFactory
      .getLogger(PdfPageCounterHandler.class);

  private static final Pattern PAGE_NUMBER_PATTERN = Pattern
      .compile("Pages:(?:\\s*)(\\d*)");

  /**
   * @return The number of pages inside the scanned PDF document
   */
  public int numberOfPages() {
    try {
      Matcher m = PAGE_NUMBER_PATTERN.matcher(stdoutBuilder.toString());
      m.find();
      return Integer.parseInt(m.group(1).trim());
    } catch (Exception e) {
      log.error("Exception counting images", e);
      return 0;
    }
  }
}
