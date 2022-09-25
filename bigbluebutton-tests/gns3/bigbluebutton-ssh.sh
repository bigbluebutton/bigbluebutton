
# Bash function to establish ssh sessions into a BigBlueButton virtual testing network
#
# We need to do remote hostname lookups (via ssh) to find the IP addresses
# for the ssh jump hosts.
#
# Not a bash script!  Needs to be sourced, like 'source bigbluebutton-ssh.sh'
#
# The 'NAT1' variable needs to be set to the IP address or hostname used
# to access the BigBlueButton virtual network.
#
# Explaination:
#    - NAT1 always listens for DNS on its 128.8.8.254 interface.
#    - Each BigBlueButton server attaches to NAT1 via its own NAT gateway
#      that registers itself with NAT1 using the server's hostname
#    - The actual server resides on a private subnet, behind its NAT gateway,
#      at 192.168.1.2
#    - 'testclient' is usually behind its own NAT gateway, usually NAT4

function ssh() {
   local NAT1=192.168.4.198
   local SSH_OPTIONS="-o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null"
   case $1 in
   focal-*-NAT)
      local HOSTNAME=$(echo $1 | cut -d - -f 1-2)
      local PUBLIC_IP=$(command ssh ubuntu@$NAT1 dig +short @128.8.8.254 $HOSTNAME)
      shift
      echo ssh $SSH_OPTIONS -J ubuntu@$NAT1 ubuntu@$PUBLIC_IP "$@"
      command ssh $SSH_OPTIONS -J ubuntu@$NAT1 ubuntu@$PUBLIC_IP "$@"
      ;;
   focal-*)
      local PUBLIC_IP=$(command ssh ubuntu@$NAT1 dig +short @128.8.8.254 $1)
      shift
      echo ssh $SSH_OPTIONS -J ubuntu@$NAT1,ubuntu@$PUBLIC_IP ubuntu@192.168.1.2 "$@"
      command ssh $SSH_OPTIONS -J ubuntu@$NAT1,ubuntu@$PUBLIC_IP ubuntu@192.168.1.2 "$@"
      ;;
   NAT4)
      local PUBLIC_IP=$(command ssh ubuntu@$NAT1 dig +short @128.8.8.254 $1)
      shift
      echo ssh $SSH_OPTIONS -J ubuntu@$NAT1 ubuntu@$PUBLIC_IP "$@"
      command ssh $SSH_OPTIONS -J ubuntu@$NAT1 ubuntu@$PUBLIC_IP "$@"
      ;;
   # usually this is testclient-NAT4, but it can be any host behind NAT4,
   # since NAT4 is a DNS server for its DHCP clients
   *-NAT4)
      local HOSTNAME=$(echo $1 | cut -d - -f 1)
      local PUBLIC_IP=$(command ssh ubuntu@$NAT1 dig +short @128.8.8.254 NAT4)
      local PRIVATE_IP=$(command ssh -J ubuntu@$NAT1 ubuntu@$PUBLIC_IP dig +short @192.168.128.1 $HOSTNAME)
      shift
      echo ssh $SSH_OPTIONS -J ubuntu@$NAT1,ubuntu@$PUBLIC_IP ubuntu@$PRIVATE_IP "$@"
      command ssh $SSH_OPTIONS -J ubuntu@$NAT1,ubuntu@$PUBLIC_IP ubuntu@$PRIVATE_IP "$@"
      ;;
   *)
      command ssh "$@"
      ;;
   esac
}
