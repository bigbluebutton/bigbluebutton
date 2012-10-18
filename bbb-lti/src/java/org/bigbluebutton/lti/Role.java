/* 
    BigBlueButton - http://www.bigbluebutton.org

    Copyright (c) 2008-2012 by respective authors (see below). All rights reserved.

    BigBlueButton is free software; you can redistribute it and/or modify it under the 
    terms of the GNU Lesser General Public License as published by the Free Software 
    Foundation; either version 2 of the License, or (at your option) any later 
    version.  

    BigBlueButton is distributed in the hope that it will be useful, but WITHOUT ANY 
    WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A 
    PARTICULAR PURPOSE. See the GNU Lesser General Public License for more details.

    You should have received a copy of the GNU Lesser General Public License along 
    with BigBlueButton; if not, If not, see <http://www.gnu.org/licenses/>.

    Author: Jesus Federico <jesus@blindsidenetworks.com>
*/  
package org.bigbluebutton.lti;

public class Role {

    public static String STUDENT = "Student";
    public static String FACULTY = "Faculty";
    public static String MEMBER = "Member";
    public static String LEARNER = "Learner";
    public static String INSTRUCTOR = "Instructor";
    public static String MENTOR = "Mentor";
    public static String STAFF = "Staff";
    public static String ALUMNI = "Alumni";
    public static String PROSPECTIVESTUDENT = "ProspectiveStudent";
    public static String GUEST = "Guest";
    public static String OTHER = "Other";
    public static String ADMINISTRATOR = "Administrator";
    public static String OBSERVER = "Observer";
    public static String NONE = "None";
    
    public static String URN_SYSTEM_ROLE = "urn:lti:sysrole:ims/lis/";
    public static String URN_INSTITUTION_ROLE = "urn:lti:instrole:ims/lis/";
    public static String URN_CONTEXT_ROLE = "urn:lti:role:ims/lis/";

    public static boolean isModerator(String _roles){
        boolean response = false;
        
        String[] roles = _roles.split(",");
        for( int i=0; i < roles.length; i++){
            if( roles[i].equals(FACULTY) ||
                roles[i].equals(URN_INSTITUTION_ROLE + FACULTY) ||
                roles[i].equals(INSTRUCTOR) ||
                roles[i].equals(URN_INSTITUTION_ROLE + INSTRUCTOR) ||
                roles[i].equals(MENTOR) ||
                roles[i].equals(URN_INSTITUTION_ROLE + MENTOR) ||
                roles[i].equals(URN_INSTITUTION_ROLE + ADMINISTRATOR)
                ){
                response = true;
                break;
            }
        }
        
        return response;
    }
}
