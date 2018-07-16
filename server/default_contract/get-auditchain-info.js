const fs = require('fs');
const solc = require('solc');
const path = require('path');

const ymlPath = path.join(__dirname, 'auditchain.sol');
const auditchain = fs.readFileSync(ymlPath, 'utf-8');
const output = solc.compile(auditchain.toString(), 1);

const auditchainBytecode = output.contracts[':AuditChain'].bytecode;
const auditchainABI = JSON.parse(output.contracts[':AuditChain'].interface);
let auditchainAddress = undefined;

function replaceAll(string, search, replacement) {
    return string.replace(new RegExp(search, 'g'), replacement);
}

function getAuditChainABI() {
    return auditchainABI;
}

function getAuditChainBytecode() {
    return "0x" + auditchainBytecode;
}

function getAuditChainAddress() {
    return auditchainAddress;
}

function setAuditChainAddress(_auditchainAddress) {
    auditchainAddress = _auditchainAddress;
}


exports.getAuditChainAddress = getAuditChainAddress;
exports.getAuditChainABI = getAuditChainABI;
exports.getAuditChainBytecode = getAuditChainBytecode;
exports.setAuditChainAddress = setAuditChainAddress;
