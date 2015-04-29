package local.server;


import org.zoolu.sip.provider.SipStack;
import org.zoolu.sip.header.StatusLine;
import org.zoolu.sip.message.Message;
import org.zoolu.sip.message.SipMethods;
import org.zoolu.tools.Log;
import org.zoolu.tools.DateFormat;

import java.util.Hashtable;
import java.util.Vector;
import java.util.Date;


/** CallLoggerImpl implements a simple CallLogger.
  * <p> A CallLogger keeps trace of all processed calls.
  */
public class CallLoggerImpl implements CallLogger
{
   /** Maximum number of concurrent calls. */
   static final int MAX_SIZE=10000;

   /** Table : call_id (String) --> invite date. */
   Hashtable invite_dates;
   /** Table : call_id (String) --> 2xx date (Long). */
   Hashtable accepted_dates;
   /** Table : call_id (String) --> 4xx date (Long). */
   Hashtable refused_dates;
   /** Table : call_id (String) --> bye date (Long). */
   Hashtable bye_dates;
   
   /** Table : call_id (String) --> caller (String). */
   Hashtable callers;
   /** Table : call_id (String) --> callee (String). */
   Hashtable callees;

   /** Set : call_id (String). */
   Vector calls;

   /** Logger. */
   Log call_log;

   
   /** Costructs a new CallLoggerImpl.
     */
   public CallLoggerImpl(String filename)
   {  invite_dates=new Hashtable();
      accepted_dates=new Hashtable();
      refused_dates=new Hashtable();
      bye_dates=new Hashtable();   
      calls=new Vector();
      callers=new Hashtable();
      callees=new Hashtable();
      
      call_log=new Log(filename,null,1,-1,true);
      call_log.println("Date \tCall-Id \tStatus \tCaller \tCallee \tSetup Time \tCall Time");
   }
 
   
   /** Updates log with the present message.
     */
   public void update(Message msg)
   {
      String method=msg.getCSeqHeader().getMethod();
      String call_id=msg.getCallIdHeader().getCallId();

      if (method.equalsIgnoreCase(SipMethods.INVITE))
      {
         if (msg.isRequest())
         {  if (!invite_dates.containsKey(call_id))
            {  Date time=new Date();
               String caller=msg.getFromHeader().getNameAddress().getAddress().toString();
               String callee=msg.getToHeader().getNameAddress().getAddress().toString();
               insert(invite_dates,call_id,time);
               callers.put(call_id,caller);
               callees.put(call_id,callee);
               eventlog(time,call_id,SipMethods.INVITE,caller,callee);
            }
         }
         else
         {  StatusLine status_line=msg.getStatusLine();
            int code=status_line.getCode();
            if (code>=200 && code<300 && !accepted_dates.containsKey(call_id))
            {  Date time=new Date();
               insert(accepted_dates,call_id,time);
               String reason=status_line.getReason();     
               eventlog(time,call_id,String.valueOf(code)+" "+reason,"","");
            }
            else
            if (code>=300 && !refused_dates.containsKey(call_id))
            {  Date time=new Date();
               insert(refused_dates,call_id,time);
               String reason=status_line.getReason();     
               eventlog(time,call_id,String.valueOf(code)+" "+reason,"","");
            }
         }
      }
      else
      if (method.equalsIgnoreCase(SipMethods.BYE))
      {
         if (msg.isRequest())
         {  if (!bye_dates.containsKey(call_id))
            {  Date time=new Date();
               insert(bye_dates,call_id,time);
               eventlog(time,call_id,SipMethods.BYE,"","");
               calllog(call_id);
            }
         }      
      }
   }


   /** Insters/updates a call-state table.
     */
   private void insert(Hashtable table, String call_id, Date time)
   {  if (!invite_dates.containsKey(call_id) && !accepted_dates.containsKey(call_id) && !refused_dates.containsKey(call_id) && !bye_dates.containsKey(call_id));
      {  if (calls.size()>=MAX_SIZE) 
         {  String call_0=(String)calls.elementAt(0);
            invite_dates.remove(call_0);
            accepted_dates.remove(call_0);
            refused_dates.remove(call_0);
            bye_dates.remove(call_0);
            callers.remove(call_0);
            callees.remove(call_0);
            calls.removeElementAt(0);
         }
         calls.addElement(call_id);
      }
      table.put(call_id,time);
   }


   /** Prints a generic event log.
     */
   private void eventlog(Date time, String call_id, String event, String caller, String callee)
   {  //call_log.println(DateFormat.formatHHMMSS(time)+"\t"+call_id+"\t"+event+"\t"+caller+"\t"+callee);
      call_log.println(DateFormat.formatYYYYMMDD(time)+"\t"+call_id+"\t"+event+"\t"+caller+"\t"+callee);
   }


   /** Prints a call report.
     */
   private void calllog(String call_id)
   {  Date invite_time=(Date)invite_dates.get(call_id);
      Date accepted_time=(Date)accepted_dates.get(call_id);
      Date bye_time=(Date)bye_dates.get(call_id);
      if (invite_time!=null && accepted_time!=null && bye_time!=null) 
         //call_log.println(DateFormat.formatHHMMSS(invite_time)+"\t"+call_id+"\tCALL \t"+callers.get(call_id)+"\t"+callees.get(call_id)+"\t"+(accepted_time.getTime()-invite_time.getTime())+"\t"+(bye_time.getTime()-accepted_time.getTime()));
         call_log.println(DateFormat.formatYYYYMMDD(invite_time)+"\t"+call_id+"\tCALL \t"+callers.get(call_id)+"\t"+callees.get(call_id)+"\t"+(accepted_time.getTime()-invite_time.getTime())+"\t"+(bye_time.getTime()-accepted_time.getTime()));
   }

}