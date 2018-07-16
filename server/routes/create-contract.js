const express = require('express');
const web3 = require('../web3/get-web3').getWeb3();
const router = express.Router();

router.post('/', function(req, res, next) {
    const abi = req.body.abi;
    const from = req.body.from;
    const bindata = req.body.bindata;
    const gas = req.body.gas;
    const gasPrice = req.body.gasPrice;
    const contract = new web3.eth.Contract(abi);
    contract.deploy({data: bindata}).send(
        {
            from: from,
            gas: gas,
            gasPrice: gasPrice
        })
        .on('error', function(_error){
            return next(new Error(_error));
        })
        .on('receipt', function(receipt){
            return res.status(200).json(receipt);
        });
});

module.exports = router;
