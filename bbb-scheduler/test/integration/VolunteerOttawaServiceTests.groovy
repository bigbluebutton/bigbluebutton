import VolunteerOttawaService

class VolunteerOttawaServiceTests extends GroovyTestCase {

	VolunteerOttawaService voService
	
	void setUp() {
		voService = new VolunteerOttawaService()
	}
	
    void testSomething() {
		assert voService != null
    }
}
