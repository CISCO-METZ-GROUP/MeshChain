const express = require('express');
const web3 = require('../web3/get-web3').getWeb3();
const auditchain = require('../default_contract/get-auditchain-info');
const router = express.Router();


router.post('/', function(req, res, next) {
    const address = req.body.address !== undefined ? req.body.address : auditchain.getAuditChainAddress();
    if (req.body.blockNo === undefined) {
        return next(new Error("No 'blockNo' specified in json payload"));
    }
    if (address === undefined || address.length !== 42) {
        return next(new Error("Expected an 'address' json object with 20 bytes long hex string specifying the contract address"));
    }
    web3.eth.getBlock(req.body.blockNo).then(function onResult(block) {
        const transactions = [];
        const promises = [];
        for (const transaction of block.transactions) {
            console.log(transaction);
            promises.push(web3.eth.getTransactionReceipt(transaction));
        }
        const contract = new web3.eth.Contract(auditchain.getAuditChainABI(), address);
        contract.getPastEvents('NewTrace', { fromBlock: block.number, toBlock: block.number }, (error, eventResult) => {
            if (error) {
                return next(new Error(error));
            } else {
                const event_map = {};
                for (const trace of eventResult) {
                    event_map[trace.transactionIndex] = {
                        "name": trace.returnValues.name,
                        "metadata": trace.returnValues.metadata
                    }
                }
                Promise.all(promises).then(function onResult(receipts) {
                    for (const transactionReceipt of receipts) {
                        const result = transactionReceipt.status === "0x1" ? "Successful" : "Failed";
                        transactions.push({
                                transactionIndex: transactionReceipt.transactionIndex,
                                transactionHash: transactionReceipt.transactionHash,
                                contractAddress: transactionReceipt.to,
                                sender: transactionReceipt.from,
                                gasUsed: transactionReceipt.gasUsed,
                                status: result,
                                newTrace: event_map[transactionReceipt.transactionIndex]
                            }
                        );
                    }
                    return res.status(200).json(transactions);
                }, function onError(error) {
                    return next(new Error(error));
                });
            }
        });

    }, function onError(error) {
        return next(new Error(error));
    });
});

module.exports = router;
