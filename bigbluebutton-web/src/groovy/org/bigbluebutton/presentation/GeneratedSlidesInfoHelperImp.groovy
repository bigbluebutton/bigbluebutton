package org.bigbluebutton.presentation


public class GeneratedSlidesInfoHelperImp implements GeneratedSlidesInfoHelper {

	public String generateUploadedPresentationInfo(UploadedPresentation pres) {
		def writer = new java.io.StringWriter()
		def builder = new groovy.xml.MarkupBuilder(writer)
		        		
		def uploadedpresentation = builder.uploadedpresentation {        
		    conference(id:conf, room:confRoom) {
		       presentation(name:presName) {
		          slides(count:numberOfPages) {
		             for (def i = 1; i <= numberOfPages; i++) {
		                slide(number:"${i}", name:"slide/${i}", thumb:"thumbnail/${i}")
		             }
		          }
		       }
			}
		}
	
		return writer.toString()		
	}
	
}
