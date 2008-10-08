package org.red5.server.webapp.appshare;

import java.awt.image.BufferedImage;
import java.io.ByteArrayInputStream;
import java.io.File;
import java.io.IOException;

import javax.imageio.ImageIO;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;

import org.red5.server.adapter.ApplicationAdapter;
import org.red5.server.api.IClient;
import org.red5.server.api.IConnection;
import org.red5.server.api.IScope;
import org.red5.server.api.Red5;
import org.red5.server.api.service.IServiceCapableConnection;
import org.red5.server.api.so.ISharedObject;


 

public class Application extends ApplicationAdapter {
	public byte[] byteArray;
	private String message;
	//private String [][] imageString = new String[6][6] ;
	private String imageString00;
	private String imageString01;
	private String imageString02;
	private String imageString03;
	private String imageString04;
	private String imageString05;
	private String imageString10;
	private String imageString11;
	private String imageString12;
	private String imageString13;
	private String imageString14;
	private String imageString15;
	private String imageString20;
	private String imageString21;
	private String imageString22;
	private String imageString23;
	private String imageString24;
	private String imageString25;
	private String imageString30;
	private String imageString31;
	private String imageString32;
	private String imageString33;
	private String imageString34;
	private String imageString35;
	private String imageString40;
	private String imageString41;
	private String imageString42;
	private String imageString43;
	private String imageString44;
	private String imageString45;
	private String imageString50;
	private String imageString51;
	private String imageString52;
	private String imageString53;
	private String imageString54;
	private String imageString55;
	private int row;
	private int column;
	private int tilewidth;
	private int tileheight;
	private String endOfUpdate = null;
	private static IScope appScope;
	 private static final Log log = LogFactory.getLog( Application.class );
	private boolean attribute;
	private ISharedObject so;
	//private int room = 85115;
	//private Map<String, Map> SoMap = new HashMap<String, Map>();
	
	
	@Override
    public boolean appStart (IScope app )
    {
    	super.appStart(app);
    	
    	System.out.println("-----------------------------------------------------");
	    System.out.println("appshare: appStart()");
		System.out.println("-----------------------------------------------------");
        appScope = app;
    
        return true;
    }
	public boolean roomStart(IScope room) {
		System.out.println( "appshare::roomStart - " + room.getName() );
    	if (!super.roomStart(room))
    		return false;

    	   	return true;
    }
    
		
	@Override
	public boolean roomConnect(IConnection conn, Object[] params) 
	{
        super.roomConnect(conn, params);
    	
        System.out.println( "appshare::roomConnect " + conn.getClient().getId() );
    	if (!hasSharedObject(conn.getScope(), "appSO")) {
    		createSharedObject(conn.getScope(), "appSO", false);
    		so = getSharedObject(conn.getScope(), "appSO", false);
    		
    		//roomListener.addRoom(conn.getScope().getName(), so);
    	} else {        	
        	so = getSharedObject(conn.getScope(), "appSO", false);
        	
    	}
    	
    	return true;  
		
		
		/*appScope = room;	      
	      createSharedObject(room, "appSO", true);
	      ISharedObject appSO = getSharedObject(room, "appSO");
	      //attribute =  so.setAttribute("byteArray", byteArray);
	      attribute =  appSO.setAttribute("message", "It's a message from appshare");
	      //appSO.addSharedObjectListener(new SOListener());
		  //appSO.registerServiceHandler(new SOHandler());
	      System.out.println("-----------------------------------------------------");
	      System.out.println("Is attribute set? " + attribute);
		  System.out.println("-----------------------------------------------------");
		  return true;   */         
	}
	
	public void roomLeave(IClient client, IScope room) {
    	super.roomLeave(client, room);
    	
    	System.out.println("appshare::roomLeave - " + client.getId());
    }
    
    public boolean roomJoin(IClient client, IScope room) {
    	super.roomJoin(client, room);    	
    	System.out.println("appshare::roomJoin - " + client.getId());
    	
    	//    	get the current scope that the current connection is associated with...
    	//IScope scope = Red5.getConnectionLocal().getScope();
    	//String roomNumber = scope.getName();
    	
		//IServiceCapableConnection service = (IServiceCapableConnection) Red5.getConnectionLocal();
		//service.invoke("setRoomNumber", new Object[] { roomNumber },this);     	
 	
    	return true;
    }
	public void imageString(String [] b)
    {
		//message = b;
		//so.setAttribute("stringMessages", value)
		//so.setAttribute("row", Integer.valueOf( b[1] ).intValue());
		//so.setAttribute("column", Integer.valueOf( b[2] ).intValue());
		
		switch(Integer.valueOf( b[1] ).intValue())
		{
		case 0:
			switch(Integer.valueOf( b[2] ).intValue())
			{
				case 0: so.setAttribute("imageString00", b[0]); 
				System.out.println("Length of String in imageString[0][0]: " + b[0].length()); break;
				case 1: so.setAttribute("imageString01", b[0]); 
				System.out.println("Length of String in imageString[0][1]: " + b[0].length()); break;
				case 2: so.setAttribute("imageString02", b[0]);
				System.out.println("Length of String in imageString[0][2]: " + b[0].length()); break;
				case 3: so.setAttribute("imageString03", b[0]); 
				System.out.println("Length of String in imageString[0][3]: " + b[0].length()); break;
				case 4: so.setAttribute("imageString04", b[0]);
				System.out.println("Length of String in imageString[0][4]: " + b[0].length()); break;
				case 5: so.setAttribute("imageString05", b[0]); 
				System.out.println("Length of String in imageString[0][5]: " + b[0].length()); break;
			}
			break;
		case 1:
			switch(Integer.valueOf( b[2] ).intValue())
			{
				case 0: so.setAttribute("imageString10", b[0]);
				System.out.println("Length of String in imageString[1][0]: " + b[0].length()); break;
				case 1: so.setAttribute("imageString11", b[0]);
				System.out.println("Length of String in imageString[1][1]: " + b[0].length()); break;
				case 2: so.setAttribute("imageString12", b[0]);
				System.out.println("Length of String in imageString[1][2]: " + b[0].length()); break;
				case 3: so.setAttribute("imageString13", b[0]);
				System.out.println("Length of String in imageString[1][3]: " + b[0].length()); break;
				case 4: so.setAttribute("imageString14", b[0]);
				System.out.println("Length of String in imageString[1][4]: " + b[0].length()); break;
				case 5: so.setAttribute("imageString15", b[0]);
				System.out.println("Length of String in imageString[1][5]: " + b[0].length()); break;
			}
			break;
		case 2:
			switch(Integer.valueOf( b[2] ).intValue())
			{
				case 0: so.setAttribute("imageString20", b[0]); 
				System.out.println("Length of String in imageString[2][0]: " + b[0].length()); break;
				case 1: so.setAttribute("imageString21", b[0]);
				System.out.println("Length of String in imageString[2][1]: " + b[0].length()); break;
				case 2: so.setAttribute("imageString22", b[0]);
				System.out.println("Length of String in imageString[2][2]: " + b[0].length()); break;
				case 3: so.setAttribute("imageString23", b[0]);
				System.out.println("Length of String in imageString[2][3]: " + b[0].length()); break;
				case 4: so.setAttribute("imageString24", b[0]); 
				System.out.println("Length of String in imageString[2][4]: " + b[0].length()); break;
				case 5: so.setAttribute("imageString25", b[0]);
				System.out.println("Length of String in imageString[2][5]: " + b[0].length()); break;
			}
			break;
		
		case 3:
			switch(Integer.valueOf( b[2] ).intValue())
			{
				case 0: so.setAttribute("imageString30", b[0]);
				System.out.println("Length of String in imageString[3][0]: " + b[0].length()); break;
				case 1: so.setAttribute("imageString31", b[0]); 
				System.out.println("Length of String in imageString[3][1]: " + b[0].length()); break;
				case 2: so.setAttribute("imageString32", b[0]);
				System.out.println("Length of String in imageString[3][2]: " + b[0].length()); break;
				case 3: so.setAttribute("imageString33", b[0]);
				System.out.println("Length of String in imageString[3][3]: " + b[0].length()); break;
				case 4: so.setAttribute("imageString34", b[0]);
				System.out.println("Length of String in imageString[3][4]: " + b[0].length()); break;
				case 5: so.setAttribute("imageString35", b[0]);
				System.out.println("Length of String in imageString[3][5]: " + b[0].length()); break;
			}
			break;
		
		case 4:
			switch(Integer.valueOf( b[2] ).intValue())
			{
				case 0: so.setAttribute("imageString40", b[0]);
				System.out.println("Length of String in imageString[4][0]: " + b[0].length()); break;
				case 1: so.setAttribute("imageString41", b[0]); 
				System.out.println("Length of String in imageString[4][1]: " + b[0].length()); break;
				case 2: so.setAttribute("imageString42", b[0]); 
				System.out.println("Length of String in imageString[4][2]: " + b[0].length()); break;
				case 3: so.setAttribute("imageString43", b[0]);
				System.out.println("Length of String in imageString[4][3]: " + b[0].length()); break;
				case 4: so.setAttribute("imageString44", b[0]); 
				System.out.println("Length of String in imageString[4][4]: " + b[0].length()); break;
				case 5: so.setAttribute("imageString45", b[0]); 
				System.out.println("Length of String in imageString[4][5]: " + b[0].length()); break;
			}
			break;
		
		case 5:
			switch(Integer.valueOf( b[2] ).intValue())
			{
				case 0: so.setAttribute("imageString50", b[0]);
				System.out.println("Length of String in imageString[5][0]: " + b[0].length()); break;
				case 1: so.setAttribute("imageString51", b[0]); 
				System.out.println("Length of String in imageString[5][1]: " + b[0].length()); break;
				case 2: so.setAttribute("imageString52", b[0]); 
				System.out.println("Length of String in imageString[5][2]: " + b[0].length()); break;
				case 3: so.setAttribute("imageString53", b[0]); 
				System.out.println("Length of String in imageString[5][3]: " + b[0].length()); break;
				case 4: so.setAttribute("imageString54", b[0]);
				System.out.println("Length of String in imageString[5][4]: " + b[0].length()); break;
				case 5: so.setAttribute("imageString55", b[0]); 
				System.out.println("Length of String in imageString[5][5]: " + b[0].length()); break;
			}
			break;
		
		}
		//so.setAttribute("message", b[0]);
		

		//System.out.println("Length of String: "+ b[0].length()+" [" + b[1] + "][" + b[2] + "]");
		/*byteArray = Base64.decode(b);
		File test = new File("/test.png");
		    try
		    {
		    BufferedImage image1 = ImageIO.read ( new ByteArrayInputStream ( byteArray ) );
	   		ImageIO.write(image1, "png", test);
	   		}catch(IOException e){}
		 return b;*/
    }
	public void endOfUpdate(String [] u)
	{
		so.setAttribute("endOfUpdate", u[0]);
		so.setAttribute("tilewidth", Integer.valueOf( u[1] ).intValue());
		so.setAttribute("tileheight", Integer.valueOf( u[2] ).intValue());
	}
	
	public void sendToApplet(int x , int y)
	{
		System.out.println("mouse click: " + x + " : " + y + "\n");
	}
	@Override
	public boolean appConnect(IConnection conn, Object[] params) 
    {	
    	return super.appConnect(conn, params);
	} 
	@Override
	public void appDisconnect(IConnection conn) 
    {
    	this.clearSharedObjects(appScope, "appSO");
    	super.appDisconnect(conn);
    }
}
