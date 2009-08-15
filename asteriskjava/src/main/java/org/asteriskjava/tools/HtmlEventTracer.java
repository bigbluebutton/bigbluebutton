package org.asteriskjava.tools;

import org.asteriskjava.live.DefaultAsteriskServer;
import org.asteriskjava.manager.ManagerEventListener;
import org.asteriskjava.manager.event.*;

import java.beans.BeanInfo;
import java.beans.Introspector;
import java.beans.PropertyDescriptor;
import java.io.IOException;
import java.io.PrintWriter;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * A diagnostic tool that creates an HTML file showing the state changing events
 * received from Asterisk on the Manager API.<p>
 * The following events are shown:
 * <ul>
 * <li>NewChannel</li>
 * <li>NewState</li>
 * <li>Rename</li>
 * <li>Dial</li>
 * <li>Bridge (Link and Unlink)</li>
 * <li>Hangup</li>
 * </ul>
 * Usage: java org.asteriskjava.tools.HtmlEventTracer host username password
 *
 * @version $Id: HtmlEventTracer.java 1315 2009-06-02 22:36:54Z srt $
 */
public class HtmlEventTracer implements ManagerEventListener
{
    private String filename = "trace.html";
    private PrintWriter writer;
    private final List<String> uniqueIds;
    private final List<ManagerEvent> events;
    private final Map<Class<? extends ManagerEvent>, String> colors;

    public HtmlEventTracer()
    {
        uniqueIds = new ArrayList<String>();
        events = new ArrayList<ManagerEvent>();
        colors = new HashMap<Class<? extends ManagerEvent>, String>();

        colors.put(NewChannelEvent.class, "#7cd300"); // green
        colors.put(NewStateEvent.class, "#a4b6c8");
        colors.put(NewExtenEvent.class, "#efefef"); // grey
        colors.put(RenameEvent.class, "#ddeeff"); // light blue
        colors.put(DialEvent.class, "#feec30"); // yellow
        colors.put(BridgeEvent.class, "#fff8ae"); // light yellow
        colors.put(HangupEvent.class, "#ff6c17"); // orange

        try
        {
            writer = new PrintWriter(filename);
        }
        catch (IOException e)
        {
            e.printStackTrace();
        }
    }

    public static void main(String[] args) throws Exception
    {
        if (args.length != 3)
        {
            System.err.println("Usage: java org.asteriskjava.tools.HtmlEventTracer host username password");
            System.exit(1);
        }

        final HtmlEventTracer tracer;
        final DefaultAsteriskServer server;

        tracer = new HtmlEventTracer();
        server = new DefaultAsteriskServer(args[0], args[1], args[2]);
        server.initialize();
        server.getManagerConnection().addEventListener(tracer);

        System.err.println("Event tracer successfully started. Press Ctrl-C to write trace file and exit.");

        Runtime.getRuntime().addShutdownHook(new Thread()
        {
            @Override
            public void run()
            {
                tracer.write();
                server.shutdown();
            }
        }
        );

        while(true)
        {
            Thread.sleep(1000);
        }
    }

    @SuppressWarnings("unchecked")
    public void onManagerEvent(ManagerEvent event)
    {
        events.add(event);
        System.out.println("> " + event);
        for (String property : new String[]{"uniqueId", "uniqueId1", "uniqueId2", "srcUniqueId", "destUniqueId"})
        {
            String uniqueId;

            uniqueId = getProperty(event, property);
            if (uniqueId != null && !uniqueIds.contains(uniqueId))
            {
                uniqueIds.add(uniqueId);
            }
        }
    }

    public void write()
    {
        writer.append("<table border='1'><tr><td> </td>");
        for (String uniqueId : uniqueIds)
        {
            writer.append("<td><font size='-2'>");
            writer.append(uniqueId.substring(0, uniqueId.lastIndexOf('.') + 1));
            writer.append("</font>");
            writer.append(uniqueId.substring(uniqueId.lastIndexOf('.') + 1, uniqueId.length()));
            writer.append("</td>");
        }
        writer.append("</tr>");
        writer.println("");

        for (ManagerEvent event : events)
        {
            boolean print = false;
            StringBuilder line = new StringBuilder();

            line.append("<tr><td>");
            line.append(getLocalName(event.getClass()));
            line.append("<br><font size='-2'>");
            line.append(event.getDateReceived());
            line.append("</font></td>");
            for (String uniqueId : uniqueIds)
            {
                String text;
                text = getText(uniqueId, event);
                if (text == null)
                {
                    line.append("<td> </td>");
                }
                else
                {
                    String color = getColor(event.getClass());
                    line.append("<td bgcolor='").append(color).append("'><tt>").append(text).append("</tt></td>");
                    print = true;
                }
            }
            line.append("</tr>");
            if (print)
            {
                writer.println(line.toString());
            }
        }
        writer.append("</table>");
        writer.close();
        System.err.println("Trace file successfully written to " + filename + ".");
    }

    private String getColor(Class<? extends ManagerEvent> clazz)
    {
        for (Map.Entry<Class<? extends ManagerEvent>, String> entry : colors.entrySet())
        {
            if (entry.getKey().isAssignableFrom(clazz))
            {
                return entry.getValue();
            }
        }
        return "#ffffff";
    }

    protected String getProperty(Object obj, String property)
    {
        try
        {
            BeanInfo beanInfo = Introspector.getBeanInfo(obj.getClass());
            for (PropertyDescriptor propertyDescriptor : beanInfo.getPropertyDescriptors())
            {
                if (!propertyDescriptor.getName().equals(property))
                {
                    continue;
                }

                return propertyDescriptor.getReadMethod().invoke(obj).toString();
            }
        }
        catch (Exception e)
        {
            System.err.println("Unable to read property '" + property + "' from object " + obj + ": " + e.getMessage());
            return null;
        }

        return null;
    }

    protected String getLocalName(Class c)
    {
        String s;

        s = c.getName();
        return s.substring(s.lastIndexOf(".") + 1, s.length());
    }

    protected String getText(String uniqueId, ManagerEvent event)
    {
        String format = null;
        String[] properties = null;

        if (uniqueId.equals(getProperty(event, "uniqueId")))
        {
            if (event instanceof NewChannelEvent)
            {
                format = "%s<br>%s";
                properties = new String[]{"channel", "state"};
            }
            else if (event instanceof NewStateEvent)
            {
                format = "%s<br>%s";
                properties = new String[]{"channel", "state"};
            }
            else if (event instanceof NewExtenEvent)
            {
                format = "%s,%s,%s<br>%s(%s)";
                properties = new String[]{"context", "extension", "priority", "application", "appData"};
            }
            else if (event instanceof RenameEvent)
            {
                format = "old: %s<br>new: %s";
                properties = new String[]{"oldname", "newname"};
            }
            else if (event instanceof HoldEvent)
            {
                format = "%s";
                properties = new String[]{"status"};
            }
            else if (event instanceof AbstractParkedCallEvent)
            {
                format = "exten: %s<br>from: %s";
                properties = new String[]{"exten", "from"};
            }
            else if (event instanceof HangupEvent)
            {
                format = "%s<br>%s (%s)";
                properties = new String[]{"channel", "cause", "causeTxt"};
            }
        }

        if (event instanceof BridgeEvent)
        {
            if (uniqueId.equals(getProperty(event, "uniqueId1")))
            {
                format = "%s<br>%s<br>%s";
                properties = new String[]{"uniqueId2", "channel2", "bridgeState"};
            }
            else if (uniqueId.equals(getProperty(event, "uniqueId2")))
            {
                format = "%s<br>%s<br>%s";
                properties = new String[]{"uniqueId1", "channel1", "bridgeState"};
            }
        }

        if (event instanceof DialEvent)
        {
            if (uniqueId.equals(getProperty(event, "srcUniqueId")))
            {
                format = "To: %s";
                properties = new String[]{"destination"};
            }
            else if (uniqueId.equals(getProperty(event, "destUniqueId")))
            {
                format = "From: %s";
                properties = new String[]{"src"};
            }
        }

        if (format != null)
        {
            String[] args = new String[properties.length];

            for (int i = 0; i < properties.length; i++)
            {
                String value;

                value = getProperty(event, properties[i]);
                if (value == null)
                {
                    args[i] = "";
                }
                else
                {
                    value = value.replace("<", "&lt;");
                    value = value.replace(">", "&gt;");
                    args[i] = value;
                }
            }

            return String.format(format, (Object[]) args);
        }
        return null;
    }
}
