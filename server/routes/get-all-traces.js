const express = require('express');
const web3 = require('../web3/get-web3').getWeb3();
const auditchain = require('../default_contract/get-auditchain-info');
const router = express.Router();

router.post('/', function(req, res, next) {
    const address = req.body.address !== undefined ? req.body.address : auditchain.getAuditChainAddress();
    if (address === undefined || address.length !== 42) {
        return next(new Error("Expected an 'address' json object with 20 bytes long hex string specifying the contract address"));
    }
    let fromBlock = 0;
    if (req.body.fromBlock !== undefined) {
        fromBlock = req.body.fromBlock;
    }
    let toBlock = 'latest';
    if (req.body.toBlock !== undefined) {
        toBlock = req.body.toBlock;
    }
    const contract = new web3.eth.Contract(auditchain.getAuditChainABI(), address);
    contract.getPastEvents('NewTrace', { fromBlock: fromBlock, toBlock: toBlock }, (error, eventResult) => {
        if (error) {
            return next(new Error(error));
        } else {
            const traces = [];
            for (const trace of eventResult) {
                traces.push({
                    "name": trace.returnValues.name,
                    "metadata": trace.returnValues.metadata,
                    "blockNo": trace.blockNumber
                })
            }
            return res.status(200).json(traces);
        }
    });
});

module.exports = router;
