const express = require('express');
const web3 = require('../web3/get-web3').getWeb3();
const account = require('../coinbase_information/getcoinbase').getCoinBase();
const auditchain = require('../default_contract/get-auditchain-info');
const router = express.Router();

router.post('/', function(req, res, next) {
    const gas = 4700000;
    const gasPrice = 18000000000;
    const from = account.account;
    const address = req.body.address !== undefined ? req.body.address : auditchain.getAuditChainAddress();
    if (address === undefined || address.length !== 42) {
        return next(new Error("Expected an 'address' json object with 20 bytes long hex string specifying the contract address"));
    }
    const name = req.body.name;
    if (name === undefined) {
        return next(new Error("Expected a 'name' json object but not found"));
    }
    const contract = new web3.eth.Contract(auditchain.getAuditChainABI(), address);
    contract.methods.getTraceNos(name).call({
        from : from,
        gas: gas,
        gasPrice: gasPrice
    }).then(function (result) {
        if (result.error !== undefined) {
            return next(new Error(result.error));
        } else {
            const promises = [];
            const traceString = [];
            for (const traceNo of result) {
                promises.push(contract.methods.getTrace(traceNo).call({
                    from : from
                }));
            }
            let metadataString = undefined;
            Promise.all(promises).then(function onResults(results) {
                let metadata = true;
                for (const result of results) {
                    if (result.error !== undefined) {
                        return next(new Error(result.error));
                    }
                    if (metadata) {
                        metadataString = result;
                        metadata = false;
                    } else {
                        traceString.push(result);
                    }
                }
                return res.status(200).json({
                    trace: {
                        metadata: metadataString,
                        data: traceString.join()
                    }
                });
            }, function onError(error) {
                return next(new Error(error));
            });
        }
    });
});

module.exports = router;
