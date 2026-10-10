require('reflect-metadata');
const { X509CertificateGenerator, BasicConstraintsExtension } = require('@peculiar/x509');
const { webcrypto } = require('crypto');
const fs = require('fs');
const path = require('path');

const verbose = process.argv.includes('--verbose') ||
  !['', '0', 'false', 'no', 'off'].includes((process.env.VERBOSE || '').trim().toLowerCase());

require('dotenv').config({ quiet: !verbose });

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

const algorithm = {
  name: 'RSASSA-PKCS1-v1_5',
  modulusLength: 2048,
  publicExponent: new Uint8Array([1, 0, 1]),
  hash: 'SHA-256',
};

const toPem = (label, der) => {
  const base64 = Buffer.from(der).toString('base64').match(/.{1,64}/g).join('\n');
  return `-----BEGIN ${label}-----\n${base64}\n-----END ${label}-----\n`;
};

const main = async () => {
  const keys = await webcrypto.subtle.generateKey(algorithm, true, ['sign', 'verify']);

  const notBefore = new Date();
  const notAfter = new Date();
  notAfter.setFullYear(notBefore.getFullYear() + 10);

  const certificate = await X509CertificateGenerator.createSelfSigned({
    serialNumber: '01',
    name: 'CN=BookAPI',
    notBefore,
    notAfter,
    signingAlgorithm: algorithm,
    keys,
    extensions: [new BasicConstraintsExtension(true)],
  });

  const pemCertificate = certificate.toString('pem');
  const pemKey = toPem('PRIVATE KEY', await webcrypto.subtle.exportKey('pkcs8', keys.privateKey));

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
};

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
