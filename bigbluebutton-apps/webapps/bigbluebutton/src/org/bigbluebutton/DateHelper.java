package org.bigbluebutton;

import javax.xml.datatype.DatatypeFactory;
import javax.xml.datatype.XMLGregorianCalendar;
import javax.xml.datatype.DatatypeConfigurationException;
import java.util.Date;
import java.util.GregorianCalendar;

/**
 */
public class DateHelper {

    private DateHelper() {
    }

    private static DatatypeFactory datatypeFactory;

    //static init of datatype factory
    static {
        try {
            datatypeFactory = DatatypeFactory.newInstance();
        } catch (DatatypeConfigurationException e) {
            throw new RuntimeException(e);
        }
    }
    /**
     * parse an iso date and convert to a datetime.
     *
     * @param isodate iso date string
     * @return parsed date
     * @throws IllegalArgumentException for a bad date
     */
    public static Date parseIsoDate(String isodate) {
        XMLGregorianCalendar xcal = datatypeFactory.newXMLGregorianCalendar(
                isodate);
        GregorianCalendar gregCal = xcal.toGregorianCalendar();
        Date time = gregCal.getTime();
        return time;
    }
}
