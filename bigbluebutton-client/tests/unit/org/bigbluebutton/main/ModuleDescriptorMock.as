package org.bigbluebutton.main
{
	public class ModuleDescriptorMock
	{
        public static const SHIPPING_ZIP_CODE:String = "0123";                
        public static function createAddress(line:String, city:String, state:String, zip:String):Address        
        {            
        	var address:Address = new Address();            
        	address.line = line;            
        	address.city = city;            
        	address.state = state;            
        	address.zip = zip;            
        	return address;            
        }                
        
        public static function createAddressShipping():Address        
        {            
        	return createAddress("123 A Street", "Boston", "MA", SHIPPING_ZIP_CODE);        
        }        
        
        public static function createAddressBilling():Address        
        {            
        	return createAddress("321 B Street", "Cambridge", "MA", "02138");        
        }        
        
        public static function createOrder(lineItems:Array = null):Order        
        {            
        	var order:Order = new Order();            
        	order.shippingAddress = createAddressShipping();            
        	order.billingAddress = createAddressBilling();            
        	for each (var lineItem:LineItem in lineItems)            
        	{                
        		addLineItemToOrder(order, lineItem);            
        	}            
        	return order;            
        }                
        
        public static function addLineItemToOrder(order:Order, lineItem:LineItem):void        
        {            
        	order.addLineItem(lineItem);        
        }     
	}
}