const forge = require('node-forge');
const fs = require('fs');
const path = require('path');

require('dotenv').config();

const keyFile = process.env.KEY || 'certs/key.pem';
const certificateFile = process.env.CERTIFICATE || 'certs/cert.pem';

let exists = false;

if (fs.existsSync(keyFile)) {
  console.log(`Private key file already exists: ${keyFile}`);
  exists = true;
}

if (fs.existsSync(certificateFile)) {
  console.log(`Certificate file already exists: ${certificateFile}`);
  exists = true;
}

if (exists) {
  process.exit(1);
}

const keyPair = forge.pki.rsa.generateKeyPair(2048);
const certificate = forge.pki.createCertificate();

certificate.publicKey = keyPair.publicKey;
certificate.serialNumber = '01';
certificate.validity.notBefore = new Date();
certificate.validity.notAfter = new Date();
certificate.validity.notAfter.setFullYear(certificate.validity.notBefore.getFullYear() + 10);

const attrs = [{
  name: 'commonName',
  value: 'BookAPI'
}];

certificate.setSubject(attrs);
certificate.setIssuer(attrs);

certificate.setExtensions([{
  name: 'basicConstraints',
  cA: true
}]);

certificate.sign(keyPair.privateKey, forge.md.sha256.create());

const pemCertificate = forge.pki.certificateToPem(certificate);
const pemKey = forge.pki.privateKeyToPem(keyPair.privateKey);

const keyDirectory = path.dirname(keyFile);
const certificateDirectory = path.dirname(certificateFile);

if (!fs.existsSync(keyDirectory)) {
  fs.mkdirSync(keyDirectory, { recursive: true });
  console.log(`Created directory: ${keyDirectory}`);
}

if (!fs.existsSync(certificateDirectory)) {
  fs.mkdirSync(certificateDirectory, { recursive: true });
  console.log(`Created directory: ${certificateDirectory}`);
}

fs.writeFileSync(keyFile, pemKey);
console.log(`Generated private key: ${keyFile}`);

fs.writeFileSync(certificateFile, pemCertificate);
console.log(`Generated certificate: ${certificateFile}`);
