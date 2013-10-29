package org.bigbluebutton.api;

class UtilTest extends GroovyTestCase {
			
	void testPresentationFilename() {
		String filename = Util.cleanPresentationFilename("mypresentation%#@foo.txt");
    assertTrue(filename.equals("mypresentation---foo.txt"))
	}
  
  void testPresentationFilenameThatBeginsWithDot() {
		String filename = Util.cleanPresentationFilename(".mypresentation%#@foo.txt");
    assertTrue(filename.equals("mypresentation---foo.txt"))
	}
  
  void testPresentationFilenameWithMultipleDot() {
		String filename = Util.cleanPresentationFilename(".mypresentation%#@foo.txt.png");
    assertTrue(filename.equals("mypresentation---foo.txt.png"))
	}
}