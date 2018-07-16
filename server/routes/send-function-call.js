const express = require('express');
const getWeb3 = require('../web3/get-web3');
const web3 = getWeb3.getWeb3();
const router = express.Router();

router.post('/', function(req, res, next) {
    const abi = req.body.abi;
    const address = req.body.address;
    const params = req.body.params;
    const functionSignature = req.body.functionSignature;
    const from = req.body.from;
    const gas = req.body.gas;
    const gasPrice = req.body.gasPrice;
    const contract = new web3.eth.Contract(abi, address);
    contract.methods[functionSignature](params).call({
        from : from,
        gas: gas,
        gasPrice: gasPrice
    }).then(function (result) {
        if (result.error !== undefined) {
            return next(new Error(result.error));
        } else {
            return res.status(200).json(result);
        }
    });
});

module.exports = router;
