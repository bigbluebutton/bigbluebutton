/* 
    BigBlueButton open source conferencing system - http://www.bigbluebutton.org/

    Copyright (c) 2012 BigBlueButton Inc. and by respective authors (see below).

    This program is free software; you can redistribute it and/or modify it under the
    terms of the GNU Lesser General Public License as published by the Free Software
    Foundation; either version 3.0 of the License, or (at your option) any later
    version.

    BigBlueButton is distributed in the hope that it will be useful, but WITHOUT ANY
    WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A
    PARTICULAR PURPOSE. See the GNU Lesser General Public License for more details.

    You should have received a copy of the GNU Lesser General Public License along
    with BigBlueButton; if not, see <http://www.gnu.org/licenses/>.
*/

package org.bigbluebutton.lti;

public class Parameter {
    
    public static final String OAUTH_SIGNATURE = "oauth_signature";
    public static final String CONSUMER_ID = "oauth_consumer_key";
    public static final String USER_ID = "user_id";
    public static final String USER_FULL_NAME = "lis_person_name_full";
    public static final String USER_LASTNAME = "lis_person_name_family";
    public static final String USER_EMAIL = "lis_person_contact_email_primary";
    public static final String USER_SOURCEDID = "lis_person_sourcedid";
    public static final String USER_FIRSTNAME = "lis_person_name_given";
    public static final String COURSE_ID = "context_id";
    public static final String COURSE_TITLE = "context_title";
    public static final String RESOURCE_LINK_ID = "resource_link_id";
    public static final String RESOURCE_LINK_TITLE = "resource_link_title";
    public static final String RESOURCE_LINK_DESCRIPTION = "resource_link_description";
    public static final String ROLES = "roles";
    
    public static final String LAUNCH_LOCALE = "launch_presentation_locale";
    public static final String LAUNCH_DOCUMENT_TARGET = "launch_presentation_document_target";
    public static final String LAUNCH_CSS_URL = "launch_presentation_css_url";
    public static final String LAUNCH_RETURN_URL = "launch_presentation_return_url";
    
    public static final String TOOL_CONSUMER_CODE = "tool_consumer_info_product_family_code";
    public static final String TOOL_CONSUMER_VERSION = "tool_consumer_info_version";
    public static final String TOOL_CONSUMER_INSTANCE_NAME = "tool_consumer_instance_name";
    public static final String TOOL_CONSUMER_INSTANCE_DESCRIPTION = "tool_consumer_instance_description";
    public static final String TOOL_CONSUMER_INSTANCE_URL = "tool_consumer_instance_url";
    
    public static final String CUSTOM_USER_ID = "custom_lis_person_sourcedid";
    
    //BigBlueButton custom parameters
    public static final String CUSTOM_RECORD = "custom_record";
    public static final String CUSTOM_VOICEBRIDGE = "custom_voicebridge";
    public static final String CUSTOM_DURATION = "custom_duration";
    public static final String CUSTOM_WELCOME = "custom_welcome";
    public static final String CUSTOM_MODE = "custom_mode";
    public static final String CUSTOM_ALL_MODERATORS = "custom_all_moderators";
    
    ///BigBlueButton internal parameters
    public static final String BBB_RECORDING_ID = "bbb_recording_id";
    public static final String BBB_RECORDING_PUBLISHED = "bbb_recording_published";

}
