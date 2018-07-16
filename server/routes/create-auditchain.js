const express = require('express');
const web3 = require('../web3/get-web3').getWeb3();
const auditchain = require('../default_contract/get-auditchain-info');
const account = require('../coinbase_information/getcoinbase').getCoinBase();
const router = express.Router();

router.post('/', function(req, res, next) {
    const gas = 4700000;
    const gasPrice = 18000000000;
    const from = account.account;
    const contract = new web3.eth.Contract(auditchain.getAuditChainABI());
    contract.deploy({data: auditchain.getAuditChainBytecode()}).send(
        {
            from: from,
            gas: gas,
            gasPrice: gasPrice
        })
        .on('error', function(_error){
            return next(new Error(_error));
        })
        .on('receipt', function(receipt){
            contract._address = auditchain.getAuditChainAddress();
            auditchain.setAuditChainAddress(receipt.contractAddress);
            return res.json({
                auditchain: receipt
            });
        });
});

module.exports = router;
