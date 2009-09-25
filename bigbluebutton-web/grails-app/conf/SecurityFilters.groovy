/*
 * BigBlueButton - http://www.bigbluebutton.org
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
 * $Id: $
 */
class SecurityFilters {
    def filters = {
        // Ensure that all controllers and actions require an authenticated user,
        // except for the "public" controller
        auth(controller: "*", action: "*") {
            before = {
                // Exclude the "join" controller.
                //if ((controllerName == "join") || (controllerName == "presentation")) return true

                switch (controllerName) {
	            	case 'api':
	            	case 'portal':
            		case 'join':
            		case 'adhoc':
                	case 'presentation':
                		return true
                		break
                	case 'publicScheduledSession':
                		return true
                }
                // This just means that the user must be authenticated. He does
                // not need any particular role or permission.
                accessControl { true }
            }
        }
        
        // Creating, modifying, or deleting a user requires the "Administrator"
        // role.
        userEditing(controller: "user", action: "(create|edit|save|update|delete|list)") {
            before = {
                accessControl {
                    role("Administrator")
                }
            }
        }

        // Showing a user requires the "Administrator" *or* the "User" roles.
        userShow(controller: "user", action: "show") {
            before = {
                accessControl {
                    role("Administrator") || role("User")
                }
            }
        }
    }
}