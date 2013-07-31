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
class UncheckedExceptions {
	private static Throwable throwable;

	private UncheckedExceptions() throws Throwable {
        	throw throwable;
	}

	public static synchronized void spit(Throwable throwable) {
        	UncheckedExceptions.throwable = throwable;
		try {
			UncheckedExceptions.class.newInstance();
		} catch(InstantiationException e) {
		} catch(IllegalAccessException e) {
		} finally {
			UncheckedExceptions.throwable = null;
		}	
	}
}

