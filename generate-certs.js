const forge = require('node-forge');
const fs = require('fs');
const path = require('path');

require('dotenv').config();

const keyFile = process.env.KEY_FILE || 'certs/key.pem';
const certFile = process.env.CERT_FILE || 'certs/cert.pem';

let exists = false;

if (fs.existsSync(keyFile)) {
  console.log(`Private key file already exists: ${keyFile}`);
  exists = true;
}

if (fs.existsSync(certFile)) {
  console.log(`Certificate file already exists: ${certFile}`);
  exists = true;
}

if (exists) {
  process.exit(1);
}

const keys = forge.pki.rsa.generateKeyPair(2048);
const cert = forge.pki.createCertificate();

cert.publicKey = keys.publicKey;
cert.serialNumber = '01';
cert.validity.notBefore = new Date();
cert.validity.notAfter = new Date();
cert.validity.notAfter.setFullYear(cert.validity.notBefore.getFullYear() + 10);

const attrs = [{
  name: 'commonName',
  value: 'BookAPI'
}];

cert.setSubject(attrs);
cert.setIssuer(attrs);

cert.setExtensions([{
  name: 'basicConstraints',
  cA: true
}]);

cert.sign(keys.privateKey, forge.md.sha256.create());

const pemCert = forge.pki.certificateToPem(cert);
const pemKey = forge.pki.privateKeyToPem(keys.privateKey);

const keyDir = path.dirname(keyFile);
const certDir = path.dirname(certFile);

if (!fs.existsSync(keyDir)) {
  fs.mkdirSync(keyDir, { recursive: true });
  console.log(`Created directory: ${keyDir}`);
}

if (!fs.existsSync(certDir)) {
  fs.mkdirSync(certDir, { recursive: true });
  console.log(`Created directory: ${certDir}`);
}

fs.writeFileSync(keyFile, pemKey);
console.log(`Generated private key: ${keyFile}`);

fs.writeFileSync(certFile, pemCert);
console.log(`Generated certificate: ${certFile}`);
