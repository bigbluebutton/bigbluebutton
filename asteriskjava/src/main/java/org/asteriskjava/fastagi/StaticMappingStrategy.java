package org.asteriskjava.fastagi;

/**
 * Mapping strategy that maps all requests to the same script instance.
 *
 * @since 1.0.0
 */
public class StaticMappingStrategy implements MappingStrategy
{
    private AgiScript agiScript;

    public StaticMappingStrategy()
    {
    }

    /**
     * Creates a new StaticMappingStrategy that maps all requests to the given script.
     *
     * @param agiScript the script to map to.
     */
    public StaticMappingStrategy(AgiScript agiScript)
    {
        this.agiScript = agiScript;
    }

    /**
     * Sets the AgiScript to map to.
     *
     * @param agiScript the AgiScript to map to.
     */
    public void setAgiScript(AgiScript agiScript)
    {
        this.agiScript = agiScript;
    }

    public AgiScript determineScript(AgiRequest request)
    {
        return agiScript;
    }
}