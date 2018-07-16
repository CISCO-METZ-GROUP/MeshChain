const express = require('express');
const web3 = require('../web3/get-web3').getWeb3();
const router = express.Router();

router.post('/', function(req, res, next) {
    let fromBlock = 'latest - 10';
    if (req.body.fromBlock !== undefined) {
        fromBlock = req.body.fromBlock;
    }
    let toBlock = 'latest';
    if (req.body.toBlock !== undefined) {
        toBlock = req.body.toBlock;
    }
    web3.eth.getBlockNumber().then(function onResult(blockNo) {
        const blocks = [];
        const promises = [];
        if (toBlock === 'latest' || toBlock > blockNo) {
            toBlock = blockNo;
        }
        if (fromBlock.includes('latest')) {
            fromBlock = blockNo - fromBlock.replace(/\s/g, '').split("-")[1];
        } else if (fromBlock > blockNo) {
            fromBlock = blockNo;
        }
        for (let i = toBlock; i >= fromBlock; i--) {
            promises.push(web3.eth.getBlock(i));
        }
        Promise.all(promises).then(function onResult(blockInfoList) {
            for (const block of blockInfoList) {
                blocks.push({
                    number: block.number,
                    timestamp: block.timestamp,
                    hash: block.hash,
                    gasLimit: block.gasLimit,
                    gasUsed: block.gasUsed,
                    miner: block.miner,
                    transactionCount: block.transactions.length
                });
            }
            return res.status(200).json(blocks);
        }, function onError(error) {
            return next(new Error(error));
        })
    }, function onError(error) {
        return next(new Error(error));
    });
});

module.exports = router;
