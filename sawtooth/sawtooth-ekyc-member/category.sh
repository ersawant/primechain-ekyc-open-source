#!/bin/bash

./pyclient/simplewallet kycCategory "{\"1000\": \"Basic information & records\",\"1050\": \"Addresses and contact information\",\"1100\": \"Product and Service Lines\",\"1150\": \"Contracts\",\"1200\": \"Customer related\",\"1250\": \"Registration Documents (Non-tax)\",
\"1350\": \"Employees and Employee Benefits\",\"1400\": \"Professional firms\",\"2000\": \"Financial Information\",\"2050\": \"Tax Registration Documents\",\"2100\": \"Tax related records\",\"2150\": \"Securities Issuances\",\"2200\": \"Charge on assets\",\"2250\": \"Stressed assets, NPAs, defaults\",\"2300\": \"Insurance Coverage\",\"2400\": \"AML & CFT\",\"3000\": \"Physical Assets & Real Estate\",\"4000\": \"Intellectual Property\",\"5000\": \"Environmental Issues\",\"6000\": \"Litigation\",\"7000\": \"Media & PR\"
}" categories kycCode


./pyclient/simplewallet kycCategory "{\"10001010\": \"Certificate of incorporation\",\"10001020\": \"Memorandum of Association\",\"10001025\": \"Amendments to Memorandum of Association\",\"10001030\": \"Articles of Association\",\"10001035\": \"Amendments to Articles of Association\",\"10001040\": \"By-laws\",\"10001045\": \"Amendments to by-laws\",\"10001050\": \"Minutes of meetings\",\"10001060\": \"Organizational chart\",\"10001070\": \"Certificate of Good Standing\",\"10001080\": \"Active status reports in the state / country of incorporation\",\"10001090\": \"Assumed name and copy of registrations\",\"10001100\": \"List of states, provinces, countries where the entity is authorized to do business\",\"10001110\": \"Details of shareholders\"  
}" categories 1000

./pyclient/simplewallet kycCategory "{\"10501010\": \"Utility bill\",\"10501020\": \"Rental or Lease Agreement\",\"10501030\": \"Schedule of business locations\"}" categories 1050

./pyclient/simplewallet kycCategory "{\"11001010\": \"Details of existing products / services\",\"11001020\": \"Details of products / services under development\",\"11001030\": \"Correspondence and reports related to regulatory approvals / disapprovals of entity's products / services\",\"11001040\": \"Details of complaints / warranty claims\",\"11001050\": \"Details of tests, evaluations, studies, surveys, other data regarding products / services\"
}" categories 1100

./pyclient/simplewallet kycCategory "{\"11501010\": \"Details of subsidiary relationships and obligations\",\"11501020\": \"Details of partnership relationships and obligations\",\"11501030\": \"Details of joint venture relationships and obligations\",\"11501040\": \"Contracts between the entity and its officers, directors, shareholders, affiliates\",\"11501050\": \"Instalment sale agreement\",
\"11501060\": \"Distribution agreement\",\"11501070\": \"Sales representative agreement\",\"11501080\": \"Marketing agreement\",
\"11501090\": \"Supply agreement\",\"11501100\": \"Letters of intent from mergers, acquisitions, divestitures\",\"11501110\": \"Contracts from mergers, acquisitions, divestitures\",\"11501120\": \"Closing transcripts from mergers, acquisitions, divestitures\",\"11501130\": \"Details of options and stock purchase agreements involving interests in other entities\",\"11501140\": \"Standard quote, purchase order, invoice, warranty forms\",\"11501150\": \"Non-disclosure or non-competition agreements to which the entity is a party\",\"11501160\": \"Licensing agreements, franchises, and conditional sales contracts to which the entity is a party\",
\"11501170\": \"Agreements with distributors, VAR's, OEM's, dealers and sales representatives\",\"11501180\": \"Long-term sales contracts\",\"11501190\": \"Entity-financed customer purchase agreement\",\"11501200\": \"Other material contracts\"
}" categories 1150

./pyclient/simplewallet kycCategory "{\"12001010\": \"Supply / service agreements\",\"12001020\": \"Purchasing policies\",\"12001030\": \"Credit policy\",\"12001040\": \"Details of unfilled orders\",\"12001050\": \"Details of major customers lost\",\"12001060\": \"Surveys and market research reports relevant to products / services\",\"12001070\": \"Entity's major competitors\"
}" categories 1200

./pyclient/simplewallet kycCategory "{\"12501010\": \"Import Export license\",\"12501020\": \"Municipal license\",\"12501030\": \"Trade /Commercial license\"
}" categories 1250

./pyclient/simplewallet kycCategory "{\"13501010\": \"Employment, consulting, non-disclosure, non-solicitation or non-competition agreements between the entity and employees\",\"13501020\": \"Details of key employees\",\"13501030\": \"Personnel handbook\",\"13501040\": \"Schedule of employee benefits and holiday, vacation, sick leave policies\",\"13501050\": \"Details of retirement plans\",
\"13501060\": \"Collective bargaining agreements\",\"13501070\": \"Details of alleged wrongful termination, harassment, and discrimination incidents\",\"13501080\": \"Details of labor disputes, requests for arbitration, grievance procedures\",\"13501090\": \"Details of employee health and welfare insurance policies\",\"13501100\": \"Worker's compensation claim history\",\"13501110\": \"Description of unemployment insurance claims\",\"13501120\": \"Stock options, stock purchase plans and details of grants thereunder\",\"13501130\": \"Details of instance in which the entity has corrected unsafe working conditions\",\"13501140\": \"Founders agreements, management employment agreements, indemnification agreements, golden parachute agreements\",\"13501150\": \"Description of any transactions between the entity and any insider e.g. officer, director, owner etc\"
}" categories 1350

./pyclient/simplewallet kycCategory "{\"14001010\": \"Details of law firms engaged by the entity\",\"14001020\": \"Details of accounting firms engaged by the entity\",\"14001030\": \"Details of consulting firms engaged by the entity\",\"14001040\": \"Details of other professionals engaged by the entity\"
}" categories 1400

./pyclient/simplewallet kycCategory "{\"20001010\": \"Audited financial statements\",\"20001020\": \"Auditor's Reports\",\"20001025\": \"Analysis of fixed and variable expenses\",\"20001040\": \"Unaudited statements\",\"20001050\": \"Projections, capital budgets, strategic plans\",\"20001060\": \"Analyst reports\",\"20001070\": \"Schedule of contingent liabilities\",\"20001080\": \"Inventory, accounts receivable, accounts payable\",\"20001090\": \"Description of depreciation and amortization methods\",\"20001100\": \"Changes in accounting methods\",\"20001110\": \"Analysis of gross margins\",\"20001120\": \"General ledger\",\"20001130\": \"Internal control procedures\" 
}" categories 2000

./pyclient/simplewallet kycCategory "{\"20501010\": \"VAT registration record\",\"20501020\": \"GST registration record\",\"20501030\": \"Sales Tax registration record\",\"20501040\": \"Income Tax registration record\",\"20501050\": \"Other tax registration record\"
}" categories 2050

./pyclient/simplewallet kycCategory "{\"21001010\": \"Income tax filings\",\"21001020\": \"Sales tax filings\",\"21001030\": \"Tax settlement records\",\"21001040\": \"Employment tax filings\",\"21001050\": \"Excise tax filings\",\"21001060\": \"GST filings\",\"21001070\": \"VAT filings\",\"21001080\": \"Other tax filings\",\"21001090\": \"Tax liens\"
}" categories 2100

./pyclient/simplewallet kycCategory "{\"21501010\": \"Records relating to common stock / equity shares\",\"21501020\": \"Records relating to preferred stock / preference shares\",\"21501030\": \"Records relating to debentures\",\"21501040\": \"Records relating to bonds\",\"21501050\": \"Records relating to convertible securities\",\"21501060\": \"Records relating to warrants\",\"21501070\": \"Records relating to options\",\"21501080\": \"Records relating to voting trust, shareholder / similar agreement\",\"21501090\": \"Records relating to other securities\",\"21501100\": \"Records relating to repurchases, redemptions, exchanges, conversions or similar transactions\",\"21501110\": \"Records relating to registration rights or assigning such rights\",\"21501120\": \"Records relating to preemptive rights or assigning such rights\",\"21501130\": \"Reports / other communications to the entity's shareholders\",\"21501140\": \"Private placement memoranda, prospectus / other offering circulars\"
}" categories 2150

./pyclient/simplewallet kycCategory "{\"22001010\": \"Loan Sanction Documents\",\"22001020\": \"Loan agreements to which the entity is a party\",\"22001030\": \"Guaranties to which the entity is a party\",\"22001040\": \"Hypothecation related records\",\"22001050\": \"Lien related records\",\"22001060\": \"Mortgage related records\",\"22001070\": \"Pledge related records\",\"22001080\": \"Other charge related documents\",\"22001090\": \"Bank financing arrangements to which the entity is a party\",\"22001100\": \"Line of credit to which the entity is a party\",\"22001110\": \"Promissory notes to which the entity is a party\"
}" categories 2200

./pyclient/simplewallet kycCategory "{\"22501010\": \"Details of NPA, defaults\",\"22501020\": \"Net Present Value of stressed assets\"
}" categories 2250

./pyclient/simplewallet kycCategory "{\"23001010\": \"Entity's general liability policy\",\"23001020\": \"Entity's personal and real property policy\",\"23001030\": \"Entity's product liability policy\",\"23001040\": \"Entity's errors and omissions policy\",\"23001050\": \"Entity's key-man, directors and officers policy\",\"23001060\": \"Entity's worker's compensation policy\",\"23001070\": \"Entity's cyber insurance policy\",\"23001080\": \"Entity's other insurance policy\",\"23001090\": \"Entity's insurance claims\"
}" categories 2300

./pyclient/simplewallet kycCategory "{\"24001010\": \"Cross Border Wire Transfer Report\",\"24001020\": \"Suspicious Transactions Report\",
\"24001030\": \"Politically exposed persons\",\"24001040\": \"Bribery & Corruption record\"
}" categories 2400

./pyclient/simplewallet kycCategory "{\"30001010\": \"Schedule of fixed assets and locations\",\"30001020\": \"Uniform Commercial Code-1 filing\",\"30001030\": \"Lease of equipment\",\"30001040\": \"Schedule of sales and purchases of major capital equipment\",\"30001050\": \"Real estate leases deeds, mortgages, title policies, surveys, zoning approvals, variances or use permits\"
}" categories 3000

./pyclient/simplewallet kycCategory "{\"40001010\": \"Schedule of patents / patent applications\",\"40001020\": \"Schedule of trademark / trade names\",\"40001030\": \"Schedule of copyrights\",\"40001040\": \"Description of important technical know-how\",\"40001050\": \"Methods used to protect trade secrets and know-how\",\"40001060\": \"Work for hire agreements\",\"40001070\": \"Schedule of consulting agreements\",\"40001080\": \"Schedule of agreements regarding inventions\",\"40001090\": \"Schedule of licenses / assignments of intellectual property to the entity\",\"40001100\": \"Schedule of licenses / assignments of intellectual property from the entity\",\"40001110\": \"Details of claims / threatened claims, regarding intellectual property, by the entity\",
\"40001120\": \"Details of claims / threatened claims, regarding intellectual property, from the entity\"
}" categories 4000

./pyclient/simplewallet kycCategory "{\"50001010\": \"Environmental audits\",\"50001020\": \"Details of hazardous / toxic substances used in the entity's operations\",\"50001025\": \"Manner of storage and disposition of hazardous / toxic substances used in the entity's operations\",\"50001030\": \"Details of the entity's disposal methods\",\"50001040\": \"Environmental permits and licenses\",\"50001050\": \"Correspondence, notices and files related to environmental regulatory agencies\",\"50001060\": \"Details of environmental litigation / investigation\",\"50001070\": \"Details of known superfund exposure\",\"50001080\": \"Contingent environmental liabilities / continuing indemnification obligations\",\"50001090\": \"Details of incidents involving the release of a potentially hazardous amount of any carcinogen into, or presence of asbestos in, the workplace\",\"50001110\": \"Details of all the facilities of the entity that discharge waste into any body of water, stream or any sanitation systems\",\"50001120\": \"Details of occasions in which a liquid or solid waste material or any fuel or other Hazardous Material was accidentally or intentionally spilled or released\"
}" categories 5000

./pyclient/simplewallet kycCategory "{\"60001010\": \"Details of pending litigation\",\"60001020\": \"Details of threatened litigation\",
\"60001030\": \"Details of insurance policies possibly providing coverage for pending / threatened litigation\",\"60001040\": \"Injunctions, consent decrees, settlements to which the entity is a party\",\"60001050\": \"Details of court orders / judgments to which the entity is a party\"
}" categories 6000

./pyclient/simplewallet kycCategory "{\"70001010\": \"Adverse Media reports\",\"70001020\": \"Press release\"
}" categories 7000 
