package local.server;


import org.zoolu.net.SocketAddress;
import org.zoolu.sip.address.*;
import org.zoolu.sip.provider.*;
import org.zoolu.tools.Configure;
import org.zoolu.tools.Parser;

import java.io.*;
import java.net.InetAddress;
import java.util.Vector;


/** ServerProfile maintains the server configuration.
  */
public class ServerProfile extends Configure
{
   /** The default configuration file */
   private static String config_file="mjsip.cfg";


   // ********************* server configurations ********************

   /** The domain names that the server administers.
     * <p>It lists the domain names for which the Location Service maintains user bindings.
     * <br>Use 'auto-configuration' for automatic configuration of the domain name. */
   public String[] domain_names=null;
   /** Whether consider any port as valid local domain port
     * (regardless which sip port is used). */
   public boolean domain_port_any=false;

   /** Whether the Server should act as Registrar (i.e. respond to REGISTER requests). */
   public boolean is_registrar=true;
   /** Maximum expires time (in seconds). */
   public int expires=3600;
   /** Whether the Registrar can register new users (i.e. REGISTER requests from unregistered users). */
   public boolean register_new_users=true;
   /** Whether the Server relays requests for (or to) non-local users. */
   public boolean is_open_proxy=true;
   /** The type of location service.
     * You can specify the location service type (e.g. local, ldap, radius, mysql)
     * or the class name (e.g. local.server.LocationServiceImpl). */
   public String location_service="local";
   /** The name of the location DB. */
   public String location_db="users.db";
   /** Whether location DB has to be cleaned at startup. */
   public boolean clean_location_db=false;

   /** Whether the Server authenticates local users. */
   public boolean do_authentication=false;
   /** Whether the Proxy authenticates users. */
   public boolean do_proxy_authentication=false;
   /** The authentication scheme.
     * You can specify the authentication scheme name (e.g. Digest, AKA, etc.)
     * or the class name (e.g. local.server.AuthenticationServerImpl). */
   public String authentication_scheme="Digest";
   /** The authentication realm.
     * If not defined or equal to 'NONE' (default), the used via address is used instead. */
   public String authentication_realm=null;
   /** The type of authentication service.
     * You can specify the authentication service type (e.g. local, ldap, radius, mysql)
     * or the class name (e.g. local.server.AuthenticationServiceImpl). */
   public String authentication_service="local";
   /** The name of the authentication DB. */
   public String authentication_db="aaa.db";

   /** Whether maintaining a complete call log. */
   public boolean call_log=false;
   /** Whether the server should stay in the signaling path (uses Record-Route/Route) */
   public boolean on_route=false;
   /** Whether implementing the RFC3261 Loose Route (or RFC2543 Strict Route) rule */
   public boolean loose_route=true;
   /** Whether checking for loops before forwarding a request (Loop Detection). In RFC3261 it is optional. */
   public boolean loop_detection=true;

   /** Array of RoutingRules based on pairs of username or phone prefix and corresponding nexthop address.
     * It provides static rules for routing number-based SIP-URL the server is responsible for.
     * Use "default" (or "*") as default prefix.
     * Example, request URL sip:01234567@zoopera.com received by a server responsible for domain name 'zoopera.com'.
     * phone_routing_rules={prefix=0123,nexthop=127.0.0.2:7002} {prefix=*,nexthop=127.0.0.3:7003} */
   public RoutingRule[] phone_routing_rules=null;

   /** Array of RoutingRules based on pairs of destination domain and corresponding nexthop address.
     * It provides static rules for routing domain-based SIP-URL the server is NOT responsible for.
     * It make the server acting (also) as 'Interrogating' Proxy, i.e. I-CSCF in the 3G networks.
     * Example, domain_routing_rules={domain=wonderland.net,nexthop=neverland.net:5060} */
   public RoutingRule[] domain_routing_rules=null;


   // ************************** costructors *************************

   /** Costructs a new ServerProfile */
   public ServerProfile(String file)
   {  // load SipStack first
      if (!SipStack.isInit()) SipStack.init();
      // load configuration
      loadFile(file);
      // post-load manipulation
      if (authentication_realm!=null && authentication_realm.equals(Configure.NONE)) authentication_realm=null;
      if (domain_names==null) domain_names=new String[0];
      if (phone_routing_rules==null) phone_routing_rules=new RoutingRule[0];
      if (domain_routing_rules==null) domain_routing_rules=new RoutingRule[0];
   }


   /** Parses a single line of the file */
   protected void parseLine(String line)
   {  String attribute;
      Parser par;
      int index=line.indexOf("=");
      if (index>0) {  attribute=line.substring(0,index).trim(); par=new Parser(line,index+1);  }
      else {  attribute=line; par=new Parser("");  }

      if (attribute.equals("is_registrar")) { is_registrar=(par.getString().toLowerCase().startsWith("y")); return; }
      if (attribute.equals("expires"))        { expires=par.getInt(); return; }
      if (attribute.equals("register_new_users")) { register_new_users=(par.getString().toLowerCase().startsWith("y")); return; }
      if (attribute.equals("is_open_proxy")) { is_open_proxy=(par.getString().toLowerCase().startsWith("y")); return; }
      if (attribute.equals("location_service")) { location_service=par.getString(); return; }
      if (attribute.equals("location_db")) { location_db=par.getString(); return; }
      if (attribute.equals("clean_location_db")) { clean_location_db=(par.getString().toLowerCase().startsWith("y")); return; }

      if (attribute.equals("do_authentication")) { do_authentication=(par.getString().toLowerCase().startsWith("y")); return; }
      if (attribute.equals("do_proxy_authentication")) { do_proxy_authentication=(par.getString().toLowerCase().startsWith("y")); return; }
      if (attribute.equals("authentication_scheme")) { authentication_scheme=par.getString(); return; }
      if (attribute.equals("authentication_realm")) { authentication_realm=par.getString(); return; }
      if (attribute.equals("authentication_service")) { authentication_service=par.getString(); return; }
      if (attribute.equals("authentication_db")) { authentication_db=par.getString(); return; }

      if (attribute.equals("call_log")) { call_log=(par.getString().toLowerCase().startsWith("y")); return; }
      if (attribute.equals("on_route")) { on_route=(par.getString().toLowerCase().startsWith("y")); return; }
      if (attribute.equals("loose_route")) { loose_route=(par.getString().toLowerCase().startsWith("y")); return; }
      if (attribute.equals("loop_detection")) { loop_detection=(par.getString().toLowerCase().startsWith("y")); return; }

      if (attribute.equals("domain_port_any")) { domain_port_any=(par.getString().toLowerCase().startsWith("y")); return; }

      if (attribute.equals("domain_names"))
      {  char[] delim={' ',','};
         Vector aux=new Vector();
         do
         {  String domain=par.getWord(delim);
            if (domain.equals(SipProvider.AUTO_CONFIGURATION))
            {  // auto configuration
               String host_addr=null;
               String host_name=null;
               try
               {  InetAddress address=java.net.InetAddress.getLocalHost();
                  host_addr=address.getHostAddress();
                  host_name=address.getHostName();
               }
               catch (java.net.UnknownHostException e)
               {  if (host_addr==null) host_addr="127.0.0.1";
                  if (host_name==null) host_name="localhost";
               }
               aux.addElement(host_addr);
               aux.addElement(host_name);
            }
            else
            {  // manual configuration
               aux.addElement(domain);
            }
         }
         while (par.hasMore());
         domain_names=new String[aux.size()];
         for (int i=0; i<aux.size(); i++) domain_names[i]=(String)aux.elementAt(i);
         return;
      }
      
      if (attribute.equals("phone_routing_rules"))
      {  char[] delim={' ',',','}'};
         Vector aux=new Vector();
         par.goTo('{');
         while (par.hasMore())
         {  par.goTo("prefix").skipN(6).goTo('=').skipChar();
            String prefix=par.getWord(delim);
            if (prefix.equals("*")) prefix=PrefixRoutingRule.DEFAULT_PREFIX;
            par.goTo("nexthop").skipN(7).goTo('=').skipChar();
            String nexthop=par.getWord(delim);
            aux.addElement(new PrefixRoutingRule(prefix,new SocketAddress(nexthop)));
            par.goTo('{');
         }
         phone_routing_rules=new RoutingRule[aux.size()];
         for (int i=0; i<aux.size(); i++) phone_routing_rules[i]=(RoutingRule)aux.elementAt(i);
         return;
      }

      if (attribute.equals("domain_routing_rules"))
      {  char[] delim={' ',',','}'};
         Vector aux=new Vector();
         par.goTo('{');
         while (par.hasMore())
         {  par.goTo("domain").skipN(6).goTo('=').skipChar();
            String prefix=par.getWord(delim);
            par.goTo("nexthop").skipN(7).goTo('=').skipChar();
            String nexthop=par.getWord(delim);
            aux.addElement(new DomainRoutingRule(prefix,new SocketAddress(nexthop)));
            par.goTo('{');
         }
         domain_routing_rules=new RoutingRule[aux.size()];
         for (int i=0; i<aux.size(); i++) domain_routing_rules[i]=(RoutingRule)aux.elementAt(i);
         return;
      }
   }


   /** Converts the entire object into lines (to be saved into the config file) */
   protected String toLines()
   {  // currently not implemented..
      return toString();
   }


   /** Gets a String value for this object */
   public String toString()
   {  return domain_names.toString();
   }

}
