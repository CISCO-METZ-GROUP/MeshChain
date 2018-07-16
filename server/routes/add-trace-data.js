const express = require('express');
const web3 = require('../web3/get-web3').getWeb3();
const auditchain = require('../default_contract/get-auditchain-info');
const account = require('../coinbase_information/getcoinbase').getCoinBase();
const router = express.Router();

router.post('/', function(req, res, next) {
    const from = account.account;
    const gas = 1000000;
    const gasPrice = 18000000000;
    const address = req.body.address !== undefined ? req.body.address : auditchain.getAuditChainAddress();
    if (address === undefined || address.length !== 42) {
        return next(new Error("Expected an 'address' json object with 20 bytes long hex string specifying the contract address"));
    }
    const traces = req.body.traces;
    const traceStringArray = [];
    if (traces === undefined || traces.length === 0) {
        return next(new Error("Expected a 'traces' json list but none received"));
    }
    for (let i = 0; i < traces.length; i++) {
        const trace = traces[i];
        if (trace.name === undefined) {
            return next(new Error("Expected a 'name' json object but none received"));
        }
        if (trace.data === undefined) {
            return next(new Error("Expected a 'data' json object but none received"));
        }
        if (trace.metadata === undefined) {
            return next(new Error("Expected a 'metadata' json object but none received"));
        }
        if (trace.data.length > 255000) {
            return next(new Error("String length larger than 255k characters. Please consider splitting the trace into separate files"));
        }
        traceStringArray.push([trace.name, 0, trace.metadata]);
        let j = 1;
        for (let i = 0; i < trace.data.length; i+= 1000) {
            traceStringArray.push([trace.name, j, trace.data.substring(i, i + 1000 < trace.data.length ? i + 1000 : trace.data.length)]);
            j ++;
        }
    }
    const promises = [];
    const contract = new web3.eth.Contract(auditchain.getAuditChainABI(), address);
    for (const traceStringParams of traceStringArray) {
        promises.push(contract.methods.addData(traceStringParams[0], traceStringParams[1], traceStringParams[2]).send({
            from: from,
            gas: gas,
            gasPrice: gasPrice
        }));
    }
    const receiptList = [];
    Promise.all(promises).then(function onReceipts(receipts) {
        for (const _receipt of receipts) {

            const event = _receipt.events.NewTrace;
            let eventJson = undefined;
            if (event !== undefined) {
                eventJson = {
                    index: event.logIndex,
                    name: event.returnValues.name,
                    metadata: event.returnValues.metadata
                }
            }
            const receipt = {
                receipt: {
                    blockHash: _receipt.blockHash,
                    blockNumber: _receipt.blockNumber,
                    transactionHash: _receipt.transactionHash,
                    transactionIndex: _receipt.transactionIndex,
                    contractAddress: _receipt.to,
                    status: _receipt.status,
                    from: _receipt.from,
                    gasUsed: _receipt.gasUsed,
                    addedTrace: eventJson
                }
            };
            if (_receipt.status === "0x0") {
                return next(new Error("Run out of Gas with maximum limit: " + gas + " in transaction: " + _receipt.transactionHash +
                    " at block: " + _receipt.blockNumber));
            } else {
                receiptList.push(receipt);
            }
        }
        return res.status(200).json(receiptList);
    }, function onError(error) {
        return next(new Error(error));
    });
});


module.exports = router;
