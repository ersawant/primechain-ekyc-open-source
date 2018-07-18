# Primechain-eKYC (Community Edition)

Primechain-eKYC is a permissioned blockchain for sharing corporate KYC records. Primechain-eKYC records are stored in the blockchain in an encrypted form and can only be viewed by entities that have been "whitelisted" by the issuer entity. This ensures data privacy and confidentiality while at the same time ensuring that records are shared only between entities that trust each other. 

Primechain-eKYC can be used intra-bank and inter-bank (nationally / globally).

| Blockchain platform  | Availability |
| ------------- | ------------- |
| Multichain | Yes |
| Hyperledger Sawtooth | Yes  |
| Hyperledger Fabric | Coming soon |

## A. Background

Financial and capital markets use the KYC (Know Your Customer) system to identify "bad" customers and minimise money laundering, tax evasion and terrorism financing. 

Efforts to prevent money laundering and the financing of terrorism are costing the financial sector billions of dollars. Banks are also exposed to huge penalties for failure to follow KYC guidelines. Costs aside, KYC can delay transactions and lead to duplication of effort between banks.


## B. Primary benefits

1. Removes duplication of effort, automates processes and reduces compliance errors.

2. Enables the distribution of encrypted updates to client information in real time.

3. Provides the historical record of all compliance activities undertaken for each customer.

4. Provides the historical record of all documents pertaining to each customer.

5. Records can be used as evidence to prove to regulators that the bank has complied with all relevant regulations.

6. Enables identification of entities attempting to create fraudulent histories.

7. Enables data and records to be analyzed to spot criminal activities.

Primechain-eKYC is a permissioned-shared blockchain. It comprises:
-	one or more admin nodes (which can connect / remove member nodes),
-	one or more member nodes (which can be used by participating entities),
-	one or more regulator nodes

## C. Third party software and components
- bcryptjs: 2.4.3
- body-parser: 1.18.3
- connect-flash: 0.1.1
- cookie-parser: 1.4.3
- croppie: 2.6.2
- express-handlebars:  3.0.0
- express-session: 1.15.6
- express-validator: 5.2.0 
- express: 4.16.3
- mongodb: 3.0.10
- mongoose: 5.1.4
- multichain 1.0.4
- passport-local: 1.0.0
- passport: 0.4.0 
- sendgrid/mail: 6.2.1  

## D. License
Primechain-eKYC is available under --- . This license does not extend to third party software and components.

## E. List of features

1. Upload records: Records can be uploaded in any format (doc, pdf, jpg etc.) upto a maximum of 10 MB per record. These records are automatically encrypted using AES symmetric encryption algorithm and the decryption keys are automatically stored in the exclusive web application of the of the uploading entity. While uploading, the following information needs to be entered - the Corporate Identity Number (CIN) of the entity to which this document relates, the document category and sub-category, a brief description and the price of the document. 

2. Searching for records based on CIN of the relevant companies and viewing relevant metadata. 

3. Search for records uploaded by your entity.

4. White-listing entities so that they can download all records uploaded by the white-lister. 

5. Whitelisting an entity. 

6. Removing an organisation from your whitelist.
