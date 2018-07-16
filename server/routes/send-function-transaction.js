const express = require('express');
const getWeb3 = require('../web3/get-web3');
const web3 = getWeb3.getWeb3();
const router = express.Router();


/* GET users listing. */
router.post('/', function(req, res, next) {
    const abi = req.body.abi;
    const address = req.body.address;
    const params = req.body.params;
    const from = req.body.from;
    const gas = req.body.gas;
    const gasPrice = req.body.gasPrice;
    const functionSignature = req.body.functionSignature;
    const contract = new web3.eth.Contract(abi, address);
    contract.methods[functionSignature](params).send({
        from: from,
        gas: gas,
        gasPrice: gasPrice
    }).on('receipt', function (receipt) {
        return res.status(200).json(receipt);
    }).on('error', function (error) {
        return next(new Error(error));
    });
});

module.exports = router;
