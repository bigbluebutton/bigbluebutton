
package org.bigbluebutton;

import junit.framework.TestCase;
import java.util.Date;
import org.bigbluebutton.DateHelper;

public class DateHelperTest extends TestCase {
    public void testDateParse() throws Exception {
        assertGoodDate("2000-01-12T12:13:14Z");
        assertGoodDate("2005-02-25T14:53:12");
        assertBadDate("2003-02-30");
        assertBadDate("Tuesday");
        assertBadDate("0000");
    }

    protected void assertGoodDate(String date) {
        try {
            Date d = DateHelper.parseIsoDate(date);
        } catch (IllegalArgumentException e) {
            fail("Expected to parse " + date + " - " + e.toString());

        }
    }

    protected void assertBadDate(String date) {
        try {
            Date d = DateHelper.parseIsoDate(date);
            fail("Expected to reject " + date);
        } catch (IllegalArgumentException e) {
            //expected
        }
    }

}
