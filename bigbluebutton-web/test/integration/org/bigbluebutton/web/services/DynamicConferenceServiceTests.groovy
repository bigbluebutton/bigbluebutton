/* BigBlueButton - http://www.bigbluebutton.org
 * 
 * 
 * Copyright (c) 2008-2009 by respective authors (see below). All rights reserved.
 * 
 * BigBlueButton is free software; you can redistribute it and/or modify it under the 
 * terms of the GNU Lesser General Public License as published by the Free Software 
 * Foundation; either version 3 of the License, or (at your option) any later 
 * version. 
 * 
 * BigBlueButton is distributed in the hope that it will be useful, but WITHOUT ANY 
 * WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A 
 * PARTICULAR PURPOSE. See the GNU Lesser General Public License for more details.
 * 
 * You should have received a copy of the GNU Lesser General Public License along 
 * with BigBlueButton; if not, If not, see <http://www.gnu.org/licenses/>.
 *
 * @author Jeremy Thomerson <jthomerson@genericconf.com>
 * @version $Id: $
 */
package org.bigbluebutton.web.services

import grails.test.*
import org.bigbluebutton.presentation.service.DynamicConference
import org.bigbluebutton.api.domain.DynamicConference

class DynamicConferenceServiceTests extends GrailsUnitTestCase {
    protected void setUp() {
        super.setUp()
    }

    protected void tearDown() {
        super.tearDown()
    }

    void testStoreConference() {
    	DynamicConferenceService service = new DynamicConferenceService()
    	DynamicConference conf = new DynamicConference("Test Conf", "abc", "123", "456", 30);
    	service.storeConference(conf);

    	assertEquals(conf, service.getConferenceByMeetingID("abc"));
    	assertEquals(conf, service.getConferenceByToken(conf.getMeetingToken()));
    }
    
}
