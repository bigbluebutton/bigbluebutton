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

package org.bigbluebutton.presentation

/*
 * Helper class to get info about the generated slides. Easier to
 * generate XML in Groovy.
 */
public class GeneratedSlidesInfoHelperImp implements GeneratedSlidesInfoHelper {

	 /*
	  * Returns an XML string containing the URL for the slides and thumbails.
	  */
	public String generateUploadedPresentationInfo(UploadedPresentation pres) {
		def writer = new java.io.StringWriter()
		def builder = new groovy.xml.MarkupBuilder(writer)
		        		
		def uploadedpresentation = builder.uploadedpresentation {        
		    conference(id:pres.meetingId, room:pres.meetingId) {
		       presentation(name:pres.presentationName) {
		          slides(count:pres.numberOfPages) {
		             for (def i = 1; i <= pres.numberOfPages; i++) {
		                slide(number:"${i}", name:"slide/${i}", thumb:"thumbnail/${i}")
		             }
		          }
		       }
			}
		}
	
		return writer.toString()		
	}
	
	
	
}
