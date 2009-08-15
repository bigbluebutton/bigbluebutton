package org.asteriskjava.fastagi;

import org.asteriskjava.manager.DefaultManagerConnection;
import org.asteriskjava.manager.ManagerConnection;

import java.util.Date;

public class GetDataScript extends BaseAgiScript
{
    public void service(AgiRequest request, AgiChannel channel) throws AgiException
    {
        channel.streamFile("tt-monkeys");
        channel.sayDateTime(new Date().getTime());
    }

    public static void main(String[] args) throws Exception
    {
        ManagerConnection connection;
        AsyncAgiServer agiServer;

        connection = new DefaultManagerConnection("localhost", "manager", "obelisk");
        agiServer = new AsyncAgiServer(new GetDataScript());
        connection.addEventListener(agiServer);
        connection.login();

        while (true)
        {
            Thread.sleep(1000L);
        }
    }
}
