#
# BigBlueButton open source conferencing system - http://www.bigbluebutton.org/
#
# Copyright (c) 2012 BigBlueButton Inc. and by respective authors (see below).
#
# This program is free software; you can redistribute it and/or modify it under the
# terms of the GNU Lesser General Public License as published by the Free Software
# Foundation; either version 3.0 of the License, or (at your option) any later
# version.
#
# BigBlueButton is distributed in the hope that it will be useful, but WITHOUT ANY
# WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A
# PARTICULAR PURPOSE. See the GNU Lesser General Public License for more details.
#
# You should have received a copy of the GNU Lesser General Public License along
# with BigBlueButton; if not, see <http://www.gnu.org/licenses/>.
#

BigBlueButton LTI Integration
=============================
BigBlueButton is an open source web conferencing system that enables universities and colleges to deliver a high-quality learning experience to remote students.  

These instructions describe how to install the BBB-LTI Plugin into a BigBlueButton server.

With this plugin you can
    - Enable a BigBlueButton server to be a LTI provider 
    - With a LMS acting as a consumer, allow users to create and join meetings using LMS external tools

Development
=============
bbb-lti is a grails project that can be compiled using the bbb-web components installed in any BigBlueButton development environment.
    
To generate the war file
    grails clean
    grails war

Deployment
=============
Place the war file into the tomcat webapps directory and restart tomcat
        
    sudo cp target/lti-0.2.war /var/lib/tomcat6/webapps/lti.war
       
Configure the properties
        
    sudo vi /var/lib/tomcat6/webapps/lti/WEB-INF/classes/lti.properties

Edit the URL and Salt of the BigBlueButton server you are going to connect to (NOTE: Remove any trailing slashes from the URL!)
    
    bigbluebuttonURL=http://yourbigbluebuttonserver.com/bigbluebutton
    
    bigbluebuttonSalt=yoursalt
        
Edit the LTI basic information
    
    ltiEndPoint=yourbigbluebuttonserver.com
        
    ltiConsumers=demo:welcome,consumer1:secret1
    
Restart tomcat
        
    sudo service tomcat6 restart
        
When running on the BigBlueButton server, create the map to this new application on nginx
    
    

How to use the service
======================
You need:

    1.  A server running any LMS which is a LTI consumer compliant 
    2.  A BigBlueButton 0.8 server running on a separate server (not on the same server as your LMS)
    3.  A server running the plugin (It can be your bigbluebutton server or any other java application server)

Add a new external tool
    In the LMS create a new external tool using the parameters added in the configuration file
    Ej.
    Consumer Key: demo
    Shared Secret: welcome
    URL: http://yourbigbluebuttonserver.com/lti/tool.xml
    
The BigBlueButton roles are assigned according to the roles in the LMS.

MODERATOR
    -Faculty
    -urn:lti:instrole:ims/lis/Faculty
    -Instructor
    -urn:lti:instrole:ims/lis/Instructor
    -Mentor
    -urn:lti:instrole:ims/lis/Mentor
    -Administrator
    -urn:lti:instrole:ims/lis/Administrator
    
ATTENDEE
    -Student    
    -urn:lti:instrole:ims/lis/Student
    -Member
    -urn:lti:instrole:ims/lis/Member
    -Learner
    -urn:lti:instrole:ims/lis/Learner
    -Staff
    -urn:lti:instrole:ims/lis/Staff
    -Alumni
    -urn:lti:instrole:ims/lis/Alumni
    -ProspectiveStudent
    -urn:lti:instrole:ims/lis/ProspectiveStudent
    -Guest
    -urn:lti:instrole:ims/lis/Guest
    -Other
    -urn:lti:instrole:ims/lis/Other
    -Observer
    -urn:lti:instrole:ims/lis/Observer
    -None
    -urn:lti:instrole:ims/lis/None    
