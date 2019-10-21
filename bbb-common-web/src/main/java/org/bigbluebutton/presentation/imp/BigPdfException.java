/**
* BigBlueButton open source conferencing system - http://www.bigbluebutton.org/
* 
* Copyright (c) 2019 BigBlueButton Inc. and by respective authors (see below).
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

@SuppressWarnings("serial")
public class BigPdfException extends Exception {
  
  private final int bigPageNumber;
  private final long bigPageSize;
  private final ExceptionType exceptionType;

  public BigPdfException(BigPdfException.ExceptionType type, int bigPageNumber, long bigPageSize) {
      super("Exception while converting PDF that has at least one big page.");
      this.bigPageNumber = bigPageNumber;
      this.bigPageSize = bigPageSize;
      exceptionType = type;
  }

  public int getBigPageNumber() {
      return bigPageNumber;
  }

  public BigPdfException.ExceptionType getExceptionType() {
      return exceptionType;
  }

  public long getBigPageSize() {
      return bigPageSize;
  }
  
  public enum ExceptionType {
    PDF_HAS_BIG_PAGE
  }
}
