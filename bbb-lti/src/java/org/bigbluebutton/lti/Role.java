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
