/*
 * (c) 2004 Stefan Reuter
 *
 * Created on Oct 28, 2004
 */
package org.asteriskjava.live;

import org.asteriskjava.config.ConfigFile;

/**
 * @author srt
 * @version $Id: MiscTest.java 991 2008-03-08 10:10:34Z srt $
 */
public class MiscTest extends AsteriskServerTestCase
{
    public void testGlobalVariables() throws Exception
    {
        server.setGlobalVariable("AJ_TEST_VAR", "foobar");
        assertEquals("foobar", server.getGlobalVariable("AJ_TEST_VAR"));
    }

    public void testFunctions() throws Exception
    {
        System.err.println(server.getGlobalVariable("DB(/Agents,1301)"));
    }

    public void testGetVoicemailboxes() throws Exception
    {
        System.err.println("mailboxes: " + server.getVoicemailboxes());
    }

    public void testGetConfig() throws Exception
    {
        ConfigFile config;

        config = server.getConfig("voicemail.conf");
        assertEquals("voicemail.conf", config.getFilename());

        System.err.println(config.getCategories());
    }

}
