export type NetworkType = {
    ipAddressType?: string;
    IPv4?: string;
    IPv6?: string; 
    bandwidth?: {
      ping?: string; 
      downloadSpeed?: string; 
      uploadSpeed?: string; 
    };
    vpn?: boolean;
};