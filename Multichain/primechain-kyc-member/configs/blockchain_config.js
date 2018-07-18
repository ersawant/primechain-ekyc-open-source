let config = {
  HOST_NAME: "localhost",     // Hostname
  RPC_PORT: "15590",                   // The port number on which Multichain's RPC service listens
  RPC_USER: "multichainrpc",  // User name for Multichain RPC service
  RPC_PASSWORD: "4XqusmyFo4GJ9bQMwm4vwGe3kyK1ABx78ndH7TQXSns4",       // Password for Multichain RPC

  // Stream that stores hashes of files obtained from hashchain UI
  STREAMS: {
    "KYC_MEMBER_MASTERLIST_STREAM": "KYC_MEMBER_MASTERLIST_STREAM",
    "KYC_DATA_STREAM": "KYC_DATA_STREAM",
    "KYC_RECORD_STREAM": "KYC_RECORD_STREAM",
    "KYC_OTHER_STREAM": "KYC_OTHER_STREAM",
    "KYC_SIGNATURE_STREAM": "KYC_SIGNATURE_STREAM",
  }
};

module.exports = config;