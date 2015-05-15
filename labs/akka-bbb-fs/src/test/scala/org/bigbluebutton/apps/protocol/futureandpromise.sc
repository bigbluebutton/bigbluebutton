package org.bigbluebutton.apps.protocol

object futureandpromise {
	import scala.util.Try
	// Some type aliases, just for getting more meaningful method signatures:
	type CoffeeBeans = String
	type GroundCoffee = String
	case class Water(temperature: Int)
	type Milk = String
	type FrothedMilk = String
	type Espresso = String
	type Cappuccino = String
	// dummy implementations of the individual steps:
	def grind(beans: CoffeeBeans): GroundCoffee = s"ground coffee of $beans"
                                                  //> grind: (beans: org.bigbluebutton.apps.protocol.futureandpromise.CoffeeBeans)
                                                  //| org.bigbluebutton.apps.protocol.futureandpromise.GroundCoffee
	def heatWater(water: Water): Water = water.copy(temperature = 85)
                                                  //> heatWater: (water: org.bigbluebutton.apps.protocol.futureandpromise.Water)or
                                                  //| g.bigbluebutton.apps.protocol.futureandpromise.Water
	def frothMilk(milk: Milk): FrothedMilk = s"frothed $milk"
                                                  //> frothMilk: (milk: org.bigbluebutton.apps.protocol.futureandpromise.Milk)org.
                                                  //| bigbluebutton.apps.protocol.futureandpromise.FrothedMilk
	def brew(coffee: GroundCoffee, heatedWater: Water): Espresso = "espresso"
                                                  //> brew: (coffee: org.bigbluebutton.apps.protocol.futureandpromise.GroundCoffee
                                                  //| , heatedWater: org.bigbluebutton.apps.protocol.futureandpromise.Water)org.bi
                                                  //| gbluebutton.apps.protocol.futureandpromise.Espresso
	def combine(espresso: Espresso, frothedMilk: FrothedMilk): Cappuccino = "cappuccino"
                                                  //> combine: (espresso: org.bigbluebutton.apps.protocol.futureandpromise.Espress
                                                  //| o, frothedMilk: org.bigbluebutton.apps.protocol.futureandpromise.FrothedMilk
                                                  //| )org.bigbluebutton.apps.protocol.futureandpromise.Cappuccino
	// some exceptions for things that might go wrong in the individual steps
	// (we'll need some of them later, use the others when experimenting
	// with the code):
	case class GrindingException(msg: String) extends Exception(msg)
	case class FrothingException(msg: String) extends Exception(msg)
	case class WaterBoilingException(msg: String) extends Exception(msg)
	case class BrewingException(msg: String) extends Exception(msg)
	// going through these steps sequentially:
	def prepareCappuccino(): Try[Cappuccino] = for {
	  ground <- Try(grind("arabica beans"))
	  water <- Try(heatWater(Water(25)))
	  espresso <- Try(brew(ground, water))
	  foam <- Try(frothMilk("milk"))
	} yield combine(espresso, foam)           //> prepareCappuccino: ()scala.util.Try[org.bigbluebutton.apps.protocol.futurea
                                                  //| ndpromise.Cappuccino]
  prepareCappuccino()                             //> res0: scala.util.Try[org.bigbluebutton.apps.protocol.futureandpromise.Cappu
                                                  //| ccino] = Success(cappuccino)
}