package main.java.simplewallet.processor;

import java.util.logging.Logger;
import java.util.AbstractMap;
import java.util.Collections;
import java.util.Collection;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Map;
import java.util.logging.Logger;

import sawtooth.sdk.processor.TransactionProcessor;
import sawtooth.sdk.processor.State;
import sawtooth.sdk.processor.TransactionHandler;
import sawtooth.sdk.processor.exceptions.InternalError;
import sawtooth.sdk.processor.exceptions.InvalidTransactionException;
import sawtooth.sdk.protobuf.TpProcessRequest;
import sawtooth.sdk.processor.Utils;
import com.google.protobuf.ByteString;


public class SimpleWalletProcessor {
    private final static Logger logger = Logger.getLogger(SimpleWalletProcessor.class.getName());

    public static void main(String[] args) {
	System.out.println("Main method....");
	//Check connection string to validator is passed in arguments.
	if (args.length != 1) {
	    logger.info("Missing argument!! Please pass validator connection string");
	}
	// Connect to validator with connection string (tcp://localhost:4004)
	TransactionProcessor simpleWalletProcessor = new TransactionProcessor(args[0]);
	// Create simple wallet transaction handler and register with the validator
	simpleWalletProcessor.addHandler(new SimpleWalletHandler());
	Thread thread = new Thread(simpleWalletProcessor);
	//start the transaction processor
	thread.run();
    }

}

/* ******************************************************************************
 * SimpleWalletHandler
 *
 * It handles the processing of operation supported by sawtoothekyc.
 * It sets the name space prefix, versions and transaction family name.
 * This is the place where you implement your transaction specific logic(Insie apply() method
 * 
 ***************************************************************************** */

class SimpleWalletHandler implements TransactionHandler {
    private final Logger logger = Logger.getLogger(SimpleWalletHandler.class.getName());
    private final static String version = "1.0";
    private final static String txnFamilyName = "sawtoothekyc";

    private String simpleWalletNameSpace;

    SimpleWalletHandler() {
	try {
	    //Initialize the simple wallet name space using first 6 characters
	    simpleWalletNameSpace = Utils.hash512(txnFamilyName.getBytes("UTF-8")).substring(0, 6);
	} catch (java.io.UnsupportedEncodingException ex) {
	    System.out.println("Unsupported the encoding format ");
	    ex.printStackTrace();
	    System.exit(1);
	}
    }
    
    /*
     * apply()
     *
     * This method is invoked for each transaction the validator
     * gets from the client
     * 
     * @param: request - contains the transaction
     *                   
     * @param: stateInfo - contains the state context
     *
     * @returns: void
     *
     * @throws: InvalidTransactionException, InternalError
     *
     */

    @Override
    public void apply(TpProcessRequest request, State stateInfo) throws InvalidTransactionException, InternalError {
        // Extract the payload as utf8 str from the transaction, in request var
	System.out.println("In apply method");
	String payload =  request.getPayload().toStringUtf8();

        // Split the csv utf-8 string
	ArrayList<String> payloadList = new ArrayList<>(Arrays.asList(payload.split("\\$")));
	if(payloadList.size() != 3) {
	    throw new InvalidTransactionException("Invalid no. of arguments: expected 3, got:" + payloadList.size());
	}
	// First argument from payload is operation name
	String operation = payloadList.get(0);
	String kycData = payloadList.get(1);
	String kycAddress = payloadList.get(2);

	// Get the user signing public key from header
	String userKey = request.getHeader().getSignerPublicKey();
	switch(operation) {
	case "addKyc" :
		addKycCategory(stateInfo, payloadList, request);
	    break;
	case "form_upload" :
		uploadForm(stateInfo, payloadList, request);
	    break;
	default:
	    String error = "Unsupported operation " + operation;
	    throw new InvalidTransactionException(error);
	}
    }

    @Override
    public Collection<String> getNameSpaces() {
	ArrayList<String> namespaces = new ArrayList<>();
	namespaces.add(simpleWalletNameSpace);
	return namespaces;
    }

    @Override
    public String getVersion() {
	return version;
    }

    @Override
    public String transactionFamilyName() {
	return txnFamilyName;
    }

    private void addKycCategory(State stateInfo, ArrayList<String> payloadList, TpProcessRequest request)
	    throws InvalidTransactionException, InternalError {
	String kycData = payloadList.get(1);
	String kycAddress = payloadList.get(2);

	// Get the user signing public key from header
	String userKey = request.getHeader().getSignerPublicKey();
	// Get the wallet key derived from the wallet user's public key
	String kycAddressKey = getWalletKey("kyccategory", kycAddress);
	// Get current data from ledger state
	Map<String, ByteString> currentLedgerEntry = stateInfo.getState(Collections.singletonList(kycAddressKey));
	String existingData = currentLedgerEntry.get(kycAddressKey).toStringUtf8();
	
	// getState() will return empty map if data doesn't exist in state
	if (existingData.isEmpty()) {
	    Map.Entry<String, ByteString> entry = new AbstractMap.SimpleEntry<String, ByteString>(kycAddressKey,
		ByteString.copyFromUtf8(kycData));
		Collection<Map.Entry<String, ByteString>> newLedgerEntry = Collections.singletonList(entry);
		stateInfo.setState(newLedgerEntry);
	}
	else {
	    Map.Entry<String, ByteString> entry = new AbstractMap.SimpleEntry<String, ByteString>(kycAddressKey,
		ByteString.copyFromUtf8(kycData));
		Collection<Map.Entry<String, ByteString>> newLedgerEntry = Collections.singletonList(entry);
		stateInfo.setState(newLedgerEntry);
    }
    }

	private void uploadForm(State stateInfo, ArrayList<String> payloadList, TpProcessRequest request)
	    throws InvalidTransactionException, InternalError {
	String formData = payloadList.get(1);
	String formKey = payloadList.get(2);

	// Get the user signing public key from header
	String userKey = request.getHeader().getSignerPublicKey();
	// Get the address key derived from the user's public key
	String formAddressKey = getWalletKey("formUpload", formKey);
	// Get current data from ledger state
	Map<String, ByteString> currentLedgerEntry = stateInfo.getState(Collections.singletonList(formAddressKey));
	String existingData = currentLedgerEntry.get(formAddressKey).toStringUtf8();
	
	// getState() will return empty map if data doesn't exist in state
	if (existingData.isEmpty()) {
	    Map.Entry<String, ByteString> entry = new AbstractMap.SimpleEntry<String, ByteString>(formAddressKey,
		ByteString.copyFromUtf8(formData));
		Collection<Map.Entry<String, ByteString>> newLedgerEntry = Collections.singletonList(entry);
		stateInfo.setState(newLedgerEntry);
	}
	else {
	    String dataAppend = existingData + "$" + formData;
		Map.Entry<String, ByteString> entry = new AbstractMap.SimpleEntry<String, ByteString>(formAddressKey,
		ByteString.copyFromUtf8(dataAppend));
		Collection<Map.Entry<String, ByteString>> newLedgerEntry = Collections.singletonList(entry);
		stateInfo.setState(newLedgerEntry);
    }
    }
   
    private String getWalletKey(String uniqueValue, String kycAddress) {
	// Generate unique key from the namespace
        // and user signer public key
	return Utils.hash512(txnFamilyName.getBytes()).substring(0, 6)
		+ Utils.hash512(uniqueValue.getBytes()).substring(0,6)
		+ Utils.hash512(kycAddress.getBytes()).substring(0,58);
    }
}

