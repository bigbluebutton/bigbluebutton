package org.asteriskjava;

import org.asteriskjava.fastagi.DefaultAgiServer;

import java.io.IOException;
import java.io.InputStream;
import java.util.Properties;

/**
 * Simple command line interface for Asterisk-Java. This class is run when Asterisk-Java is started
 * with {@code java -jar asterisk-java.jar}. It is configured as Main-Class in the manifest.<p>
 * The command line interface supports the following options:
 * <dl>
 * <dt>{@code -a}, {@code -agi [port]}<dt>
 * <dd>Starts a FastAGI server</dd>
 *
 * <dt>{@code -h}, {@code -help}<dt>
 * <dd>Displays the available options</dd>
 *
 * <dt>{@code -v}, {@code -version}</dt>
 * <dd>Displays the version of Asterisk-Java</dd>
 * </dl>
 * If no option is given a FastAGI server is started on the default port.
 * 
 * @since 1.0.0
 */
public class Cli
{
    private void parseOptions(String[] args) throws Exception
    {
        if (args.length == 0)
        {
            startAgiServer();
            return;
        }

        final String arg = args[0];
        if ("-h".equals(arg) || "-help".equals(arg))
        {
            showHelp();
        }
        else if ("-v".equals(arg) || "-version".equals(arg))
        {
            showVersion();
        }
        else if ("-a".equals(arg) || "-agi".equals(arg))
        {
            if (args.length >= 2)
            {
                Integer port = null;
                try
                {
                    port = new Integer(args[1]);
                }
                catch (NumberFormatException e)
                {
                    System.err.println("Invalid port '" + args[1] + "'. Port must be a number.");
                    exit(1);
                }
                startAgiServer(port);
            }
        }
        else
        {
            showHelp();
        }
    }

    private void showHelp()
    {
        showVersion();
        System.err.println();
        System.err.println("-a, -agi [port]\n\tStarts a FastAGI server");
        System.err.println("-h, -help\n\tDisplays the available options\n");
        System.err.println("-v, -version\n\tDisplays the version of Asterisk-Java\n");
    }

    private void showVersion()
    {
        System.out.println("Asterisk-Java " + getVersion());
    }

    private String getVersion()
    {
        String version = "<unknown>";
        final InputStream is;
        final Properties properties;

        is = getClass().getResourceAsStream("/META-INF/maven/org.asteriskjava/asterisk-java/pom.properties");
        if (is == null)
        {
            return version;
        }

        properties = new Properties();
        try
        {
            properties.load(is); // contains version, groupId and artifactId
        }
        catch (IOException e)
        {
            return version;
        }

        version = properties.getProperty("version", version);
        return version;
    }

    private void startAgiServer() throws IOException
    {
        startAgiServer(null);
    }

    private void startAgiServer(Integer port) throws IOException
    {
        final DefaultAgiServer server;

        server = new DefaultAgiServer();
        if (port != null)
        {
            server.setPort(port);
        }
        server.startup();
    }

    private void exit(int code)
    {
        System.exit(code);
    }

    public static void main(String[] args) throws Exception
    {
        new Cli().parseOptions(args);
    }
}
