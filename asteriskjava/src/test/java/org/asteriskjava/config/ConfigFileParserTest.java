package org.asteriskjava.config;

import junit.framework.TestCase;

import java.nio.CharBuffer;

public class ConfigFileParserTest extends TestCase
{
    ConfigFileReader configFileReader;

    @Override
    public void setUp()
    {
        configFileReader = new ConfigFileReader();
    }

    public void testProcessLine() throws Exception
    {
        String s = " a ;-- comment --; = b ; a line comment";
        CharBuffer buffer = CharBuffer.allocate(s.length());

        buffer.put(s);
        buffer.flip();

        configFileReader.appendCategory(new Category("cat"));
        ConfigElement configElement = configFileReader.processLine("test.conf", 1, buffer);
        assertEquals("Incorrect type of configElement", ConfigVariable.class, configElement.getClass());

        ConfigVariable configVariable = (ConfigVariable) configElement;
        assertEquals("Incorrect variable name", "a", configVariable.getName());
        assertEquals("Incorrect variable value", "b", configVariable.getValue());
        assertEquals("Incorrect comment", "a line comment", configElement.getComment());
    }

    public void testParseCategoryHeader() throws Exception
    {
        Category category;

        category = configFileReader.parseCategoryHeader("test.conf", 1, "[foo]");
        assertEquals("Incorrect category name", "foo", category.getName());
        assertEquals("Incorrect line number", 1, category.getLineNumber());
        assertEquals("Incorrect file name", "test.conf", category.getFileName());

        category = configFileReader.parseCategoryHeader("test.conf", 1, "[foo](!)");
        assertEquals("Incorrect category name", "foo", category.getName());
        assertTrue("Category not flagged as template", category.isTemplate());

        category = configFileReader.parseCategoryHeader("test.conf", 1, "[foo](+)");
        assertEquals("Incorrect category name", "foo", category.getName());

        try
        {
            configFileReader.parseCategoryHeader("test.conf", 1, "[foo](a)");
            fail("Expected exception when requesting inheritance from a non-existing catagory");
        }
        catch (ConfigParseException e)
        {
            assertEquals("Inheritance requested, but category 'a' does not exist, line 1 of test.conf", e.getMessage());
            assertEquals("Incorrect line number", 1, e.getLineNumber());
            assertEquals("Incorrect file name", "test.conf", e.getFileName());
        }

        try
        {
            configFileReader.parseCategoryHeader("test.conf", 1, "[foo");
            fail("Expected exception when closing ']' is missing");
        }
        catch (ConfigParseException e)
        {
            assertEquals(e.getMessage(), "parse error: no closing ']', line 1 of test.conf");
        }

        try
        {
            configFileReader.parseCategoryHeader("test.conf", 1, "[foo](bar");
            fail("Expected exception when closing ')' is missing");
        }
        catch (ConfigParseException e)
        {
            assertEquals(e.getMessage(), "parse error: no closing ')', line 1 of test.conf");
        }
    }

    public void testParseDirective() throws ConfigParseException
    {
        ConfigDirective configDirective;

        configDirective = configFileReader.parseDirective("abc.conf", 20, "#include \"/etc/asterisk/inc.conf\"");
        assertEquals("Incorrect type of configDirective", IncludeDirective.class, configDirective.getClass());
        assertEquals("Incorrect include file", "/etc/asterisk/inc.conf", ((IncludeDirective) configDirective).getIncludeFile());
        assertEquals("Incorrect line number", 20, configDirective.getLineNumber());
        assertEquals("Incorrect file name", "abc.conf", configDirective.getFileName());

        configDirective = configFileReader.parseDirective("abc.conf", 20, "#exec   </usr/local/test.sh>   ");
        assertEquals("Incorrect type of configDirective", ExecDirective.class, configDirective.getClass());
        assertEquals("Incorrect exec file", "/usr/local/test.sh", ((ExecDirective) configDirective).getExecFile());
        assertEquals("Incorrect line number", 20, configDirective.getLineNumber());
        assertEquals("Incorrect file name", "abc.conf", configDirective.getFileName());

        try
        {
            configFileReader.parseDirective("abc.conf", 20, "#foo");
            fail("Expected exception when parsing a line with an unknown directive");
        }
        catch (UnknownDirectiveException e)
        {
            assertEquals("Unknown directive 'foo' at line 20 of abc.conf", e.getMessage());
        }

        try
        {
            configFileReader.parseDirective("/etc/asterisk/sip.conf", 805, "#include   ");
            fail("Expected exception when parsing a line with a directive but no parameter");
        }
        catch (MissingDirectiveParameterException e)
        {
            assertEquals("Directive '#include' needs an argument (filename) at line 805 of /etc/asterisk/sip.conf", e.getMessage());
        }
    }

    public void testParseVariable() throws ConfigParseException
    {
        ConfigVariable variable;

        variable = configFileReader.parseVariable("extensions.conf", 20, "exten => s-NOANSWER,1,Hangup");
        assertEquals("Incorrect name", "exten", variable.getName());
        assertEquals("Incorrect value", "s-NOANSWER,1,Hangup", variable.getValue());
        assertEquals("Incorrect line number", 20, variable.getLineNumber());
        assertEquals("Incorrect file name", "extensions.conf", variable.getFileName());

        variable = configFileReader.parseVariable("extensions.conf", 20, "foo=");
        assertEquals("Incorrect name", "foo", variable.getName());
        assertEquals("Incorrect value", "", variable.getValue());

        try
        {
            configFileReader.parseVariable("extensions.conf", 20, "foo");
            fail("Expected exception when parsing a line without a '='");
        }
        catch (MissingEqualSignException e)
        {
            assertEquals("No '=' (equal sign) in line 20 of extensions.conf", e.getMessage());
        }
    }

    public void XtestReadConfig() throws Exception
    {
        configFileReader.readFile("/etc/asterisk/sip2.conf");

        for (Category category : configFileReader.getCategories())
        {
            System.out.println(category.format());
        }
    }
}
