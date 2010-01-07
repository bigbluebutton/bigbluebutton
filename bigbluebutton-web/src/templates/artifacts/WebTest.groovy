class @webtest.name.caps@Test extends grails.util.WebTest {

    // Unlike unit tests, functional tests are often sequence dependent.
    // Specify that sequence here.
    void suite() {
        test@webtest.name.caps@ListNewDelete()
        // add tests for more operations here
    }

    def test@webtest.name.caps@ListNewDelete() {
        webtest('@webtest.name.caps@ basic operations: view list, create new entry, view, edit, delete, view') {
            invoke(url:'@webtest.name.lower@')
            verifyText(text:'Home')

            verifyListPage(0)

            clickLink(label:'New @webtest.name.caps@')
            verifyText(text:'Create @webtest.name.caps@')
            clickButton(label:'Create')
            verifyText(text:'Show @webtest.name.caps@', description:'Detail page')
            clickLink(label:'List', description:'Back to list view')

            verifyListPage(1)

            group(description:'edit the one element') {
                clickLink(label:'Show', description:'go to detail view')
                clickButton(label:'Edit')
                verifyText(text:'Edit @webtest.name.caps@')
                clickButton(label:'Update')
                verifyText(text:'Show @webtest.name.caps@')
                clickLink(label:'List', description:'Back to list view')
            }

            verifyListPage(1)

            group(description:'delete the only element') {
                clickLink(label:'Show', description:'go to detail view')
                clickButton(label:'Delete')
                verifyXPath(xpath:"//div[@class='message']", text:/@webtest.name.caps@.*deleted./, regex:true)
            }

            verifyListPage(0)
        }
    }

    String ROW_COUNT_XPATH = "count(//td[@class='actionButtons']/..)"

    def verifyListPage(int count) {
        ant.group(description:"verify @webtest.name.caps@ list view with $count row(s)") {
            verifyText(text:'@webtest.name.caps@ List')
            verifyXPath(xpath:ROW_COUNT_XPATH, text:count, description:"$count row(s) of data expected")
        }
    }
}