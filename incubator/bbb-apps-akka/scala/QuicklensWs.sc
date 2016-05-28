object QuicklensWs {
  println("Welcome to the Scala worksheet")       //> Welcome to the Scala worksheet
  
  import com.softwaremill.quicklens._

case class Street(name: String)
case class Address(street: Street)
case class Person(address: Address, age: Int)

val person = Person(Address(Street("1 Functional Rd.")), 35)
                                                  //> person  : QuicklensWs.Person = Person(Address(Street(1 Functional Rd.)),35)
                                                  //| 

val p2 = person.modify(_.address.street.name).using(_.toUpperCase)
                                                  //> p2  : QuicklensWs.Person = Person(Address(Street(1 FUNCTIONAL RD.)),35)
val p3 = person.modify(_.address.street.name).setTo("3 OO Ln.")
                                                  //> p3  : QuicklensWs.Person = Person(Address(Street(3 OO Ln.)),35)

// or

val p4 = modify(person)(_.address.street.name).using(_.toUpperCase)
                                                  //> p4  : QuicklensWs.Person = Person(Address(Street(1 FUNCTIONAL RD.)),35)
val p5 = modify(person)(_.address.street.name).setTo("3 OO Ln.")
                                                  //> p5  : QuicklensWs.Person = Person(Address(Street(3 OO Ln.)),35)
val p6 = modify(person)(_.age).setTo(30)          //> p6  : QuicklensWs.Person = Person(Address(Street(1 Functional Rd.)),30)

}