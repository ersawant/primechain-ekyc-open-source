# Primechain-eKYC (Community Edition)

Primechain-eKYC is a permissioned blockchain for sharing corporate KYC records. Primechain-eKYC records are stored in the blockchain in an encrypted form and can only be viewed by entities that have been "whitelisted" by the issuer entity. This ensures data privacy and confidentiality while at the same time ensuring that records are shared only between entities that trust each other. 

Primechain-eKYC can be used intra-bank and inter-bank (nationally / globally).

| Blockchain platform  | Availability |
| ------------- | ------------- |
| Multichain | Yes |
| Hyperledger Sawtooth | Yes  |
| Hyperledger Fabric | Coming soon |

## A. Installation and setup

### A1. Multichain version

To setup the Primechain-eKYC admin node, see: http://www.primechaintech.com/setup_solution.php?code=kyc-admin

To setup the Primechain-eKYC member node, see: http://www.primechaintech.com/setup_solution.php?code=kyc-member

## B. Background

Financial and capital markets use the KYC (Know Your Customer) system to identify "bad" customers and minimise money laundering, tax evasion and terrorism financing. 

Efforts to prevent money laundering and the financing of terrorism are costing the financial sector billions of dollars. Banks are also exposed to huge penalties for failure to follow KYC guidelines. Costs aside, KYC can delay transactions and lead to duplication of effort between banks.

Based on discussions with banks and financial institutions across the globe and analysis of relevant industry surveys and reports, we have identified the following pain points in the current KYC and due diligence process:

1. The absence of a common standard in the KYC documentation process.
2. On-boarding a client takes several days.
3. KYC does not end at on-boarding. It starts from there. Banks are obligated to monitor and update changes to KYC data.
4. KYC costs for financial institutions are huge, amounting to millions of dollars a year.
5. Corporates don’t report KYC changes on a proactive and regular basis.
6. Banks don't update their records on a proactive and regular basis.
7. Duplication of effort involved in KYC. Companies have multiple relations with multiple banks and financial institutions and are required to provide the same information multiple times - to different banks and sometimes even to the same bank.
8. KYC and customer due diligence systems are not usually connected to the transaction monitoring systems. 

## C. Primary benefits of using blockchain powered eKYC systems

1. Removes duplication of effort, automates processes and reduces compliance errors.

2. Enables the distribution of encrypted updates to client information in real time.

3. Provides the historical record of all compliance activities undertaken for each customer.

4. Provides the historical record of all documents pertaining to each customer.

5. Records can be used as evidence to prove to regulators that the bank has complied with all relevant regulations.

6. Enables identification of entities attempting to create fraudulent histories.

7. Enables data and records to be analyzed to spot criminal activities.


## D. Third party software and components

Third party software and components: bcryptjs, body-parser, connect-flash, cookie-parser, express, express-fileupload, express-handlebars, express-session, express-validator, mongodb, mongoose, multichain, passport, passport-local, sendgrid/mail.

## E. License
Primechain-eKYC is available under Apache License 2.0. This license does not extend to third party software and components.

## F. List of features

1. Upload records: Records can be uploaded in any format (doc, pdf, jpg etc.) upto a maximum of 10 MB per record. These records are automatically encrypted using AES symmetric encryption algorithm and the decryption keys are automatically stored in the exclusive web application of the of the uploading entity. While uploading, the following information needs to be entered - the Corporate Identity Number (CIN) of the entity to which this document relates, the document category and sub-category, a brief description and the price of the document. 

2. Searching for records based on CIN of the relevant companies and viewing relevant metadata. 

3. Search for records uploaded by your entity.

4. White-listing entities so that they can download all records uploaded by the white-lister. 

5. Whitelisting an entity. 

6. Removing an organisation from your whitelist.

## G. How it works?

### G1. Uploading a record 
When a new record is uploaded to the blockchain, the following information must be provided:

1. Corporate Identity Number (CIN) of the entity to which this document relates. This information is stored in the blockchain in plain text / un-encrypted form and cannot be changed.
2. Document category. This information is stored in the blockchain in plain text / un-encrypted form and cannot be changed.
Document type. This information is stored in the blockchain in plain text / un-encrypted form and cannot be changed.
3. A brief description of the document - This information is stored in the blockchain in plain text / un-encrypted form and cannot be changed.
4. The document - This document can be in pdf, word, excel, image or other formats and is stored in the blockchain in AES encrypted form and cannot be changed. The decryption key is stored in the relevant bank's dedicated database and does NOT go into the blockchain. 

When the above information is provided, this is what happens:

1. Hash of the uploaded file is calculated.
2. The file is digitally signed using the private key of the uploader bank.
3. File Data is encrypted using AES symmetric encryption.
4. The encrypted file is converted into hexadecimal.
5. The non-encrypted data is converted into hexadecimal.
6. Hexadecimal content is uploaded to the blockchain.

Sample output:

    {
      file_hash: 84a9ceb1ee3a8b0dc509dded516483d1c4d976c13260ffcedf508cfc32b52fbe
      file_txid: 2e770002051216052b3fdb94bf78d43a8420878063f9c3411b223b38a60da81d
      data_txid: 85fc7ff1320dd43d28d459520fe5b06ebe7ad89346a819b31a5a61b01e7aac74
      signature: IBJNCjmclS2d3jd/jfepfJHFeevLdfYiN22V0T2VuetiBDMH05vziUWhUUH/tgn5HXdpSXjMFISOqFl7JPU8Tt8=
      secrect_key: ZOwWyWHiOvLGgEr4sTssiir6qUX0g3u0
      initialisation_vector: FAaZB6MuHIuX
    }

### G2. Whitelisting entities

### G3. Searching for and downloading records
