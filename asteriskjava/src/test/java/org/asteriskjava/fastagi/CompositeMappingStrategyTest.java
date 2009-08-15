package org.asteriskjava.fastagi;

import junit.framework.TestCase;

public class CompositeMappingStrategyTest extends TestCase
{
    private CompositeMappingStrategy strategy;

    @Override
    public void setUp()
    {
        strategy = new CompositeMappingStrategy(new ResourceBundleMappingStrategy("test-mapping"),
                new ClassNameMappingStrategy());
    }

    public void testAJ37ResourceBundle()
    {
        AgiRequest request = new SimpleAgiRequest();
        AgiScript script = strategy.determineScript(request);

        assertNotNull("no script determined", script);
        assertEquals("incorrect script determined", script.getClass(), HelloAgiScript.class);
    }

    public void testAJ37ClassName()
    {
        AgiRequest request = new SimpleAgiRequest("org.asteriskjava.fastagi.HelloAgiScript");
        AgiScript script = strategy.determineScript(request);

        assertNotNull("no script determined", script);
        assertEquals("incorrect script determined", script.getClass(), HelloAgiScript.class);
    }
}
