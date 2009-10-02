package org.bigbluebutton.deskshare.client.tiles;

import org.bigbluebutton.deskshare.client.tiles.Dimension;
import org.bigbluebutton.deskshare.client.tiles.Tile;
import org.bigbluebutton.deskshare.client.tiles.TileManager;
import org.testng.Assert;
import org.testng.annotations.BeforeMethod;
import org.testng.annotations.Test;

public class TileManagerTest {
	
	TileManager tm;
	
	@BeforeMethod 
	public void setUp() {
		tm = new TileManager();
		Dimension screen = new Dimension(120, 80);
		Dimension tile = new Dimension(32, 32);
			  
		tm.initialize(screen, tile);		
	}
	
	@Test(groups = { "functest", "checkintest" })
	public void computeNumberOfTilesTest() {
	  Assert.assertEquals(tm.getRowCount(), 3);
	  Assert.assertEquals(tm.getColumnCount(), 4);
	}

	@Test(groups = { "functest", "checkintest" })
	public void createTile1Test() {
	  tm.createTile(1);
	  Tile tile1 = tm.getTile(1);
	  Assert.assertEquals(tile1.getTilePosition(), 1);
	  Assert.assertEquals(tile1.getHeight(), 32);
	  Assert.assertEquals(tile1.getWidth(), 32);
	  Assert.assertEquals(tile1.getX(), 0);
	  Assert.assertEquals(tile1.getY(), 48);
	}  

	@Test(groups = { "functest", "checkintest" })
	public void createTile12Test() {
	  tm.createTile(12);
	  Tile tile12 = tm.getTile(12);
	  Assert.assertEquals(tile12.getTilePosition(), 12);
	  Assert.assertEquals(tile12.getHeight(), 16);
	  Assert.assertEquals(tile12.getWidth(), 24);
	  Assert.assertEquals(tile12.getX(), 96);
	  Assert.assertEquals(tile12.getY(), 0);
	} 
	
	@Test(groups = { "functest", "checkintest" })
	public void createTile7Test() {
	  tm.createTile(7);
	  Tile tile7 = tm.getTile(7);
	  Assert.assertEquals(tile7.getTilePosition(), 7);
	  Assert.assertEquals(tile7.getHeight(), 32);
	  Assert.assertEquals(tile7.getWidth(), 32);
	  Assert.assertEquals(tile7.getX(), 64);
	  Assert.assertEquals(tile7.getY(), 16);
	} 
	
	@Test(groups = { "functest", "checkintest" })
	public void createTile4Test() {
	  tm.createTile(4);
	  Tile tile4 = tm.getTile(4);
	  Assert.assertEquals(tile4.getTilePosition(), 4);
	  Assert.assertEquals(tile4.getHeight(), 32);
	  Assert.assertEquals(tile4.getWidth(), 24);
	  Assert.assertEquals(tile4.getX(), 96);
	  Assert.assertEquals(tile4.getY(), 48);
	} 
	
/*
	@Test(groups = { "functest", "checkintest" })
	public void tryoutsTests() {
		System.out.println(getRow(9) + "," + getCol(9) );
		System.out.println(getRow(1) + "," + getCol(1));
		System.out.println(getRow(7) + "," + getCol(7));
		System.out.println(getRow(12) + "," + getCol(12));
		System.out.println(getRow(11) + "," + getCol(11));
	} 
	
	private int getCol(int pos) {
		return (pos - 1) % 4;
	}
	private int getRow(int pos) {		
		return -(pos - (12)) / 4;
	}
*/	
}
