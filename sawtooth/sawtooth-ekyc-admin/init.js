const { createContext, CryptoFactory } = require('sawtooth-sdk/signing')
const fs = require('fs')
const path = require('path')

async function privateKeyFile (userName) {
  const context = createContext('secp256k1')
  const privateKey = context.newRandomPrivateKey()
  const signer = new CryptoFactory(context).newSigner(privateKey)
  const privateKeyHex = privateKey.asHex();
  const publicKeyHex = signer.getPublicKey().asHex();
  
  await fs.writeFile(path.resolve(__dirname, './keys/'+userName+'.priv'), privateKeyHex, (err) => {
    if (err) {
      return console.log(err)
    }
  })
  
  await fs.writeFile(path.resolve(__dirname, './keys/'+userName+'.pub'), publicKeyHex, (err) => {
    if (err) {
      return console.log(err)
    }
    console.log("Write to the file...", publicKeyHex);
  })
  
  console.log('\nGenerated files with public/private keys and REST API URL\n')
  console.log(publicKeyHex, '\n')
  console.log(privateKeyHex, '\n')
}  



module.exports = {
  privateKeyFile :privateKeyFile
};
