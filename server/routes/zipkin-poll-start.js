const express = require('express');
const router = express.Router();
const schedule = require('node-schedule');
const http = require("http");
const web3 = require('../web3/get-web3').getWeb3();
const auditchain = require('../default_contract/get-auditchain-info');
const account = require('../coinbase_information/getcoinbase').getCoinBase();
const set_job = require('../zipkin_job/zipkin-poll-job').set_job;
const get_job = require('../zipkin_job/zipkin-poll-job').get_job;


const url = 'http://10.195.77.177:32100/zipkin/api/v1/traces?annotationQuery=&limit=10&lookback=300000&minDuration=&serviceName=productpage&sortOrder=timestamp-desc';


router.post('/', function(req, res, next) {
    let j = get_job();
    var jason="";
    var counter=0;
    const address = req.body.address !== undefined ? req.body.address : auditchain.getAuditChainAddress();
    var name = "Enterprise Trace";
    if (address === undefined || address.length !== 42) {
        return next(new Error("Expected an 'address' json object with 20 bytes long hex string specifying the contract address"));
    }
    if (j === undefined) {
        set_job(schedule.scheduleJob(' */30 * * * * *', function poll_job () {
            http.get(url, function(res) {
                let body = '';
                res.on('data', function(chunk){
                    body += chunk;
                });
                res.on('end', function(){
                    const temp = [];
                    jason = JSON.parse(body);
                    for(var i = 0 ; i< jason.length ; i++){
                     for (var j =0 ; j< jason[i].length ; j++){
                         temp.push({
                             traceID: jason[i][j].traceId,
                             ID: jason[i][j].id,
                             timestamp: jason[i][j].timestamp,
                             duration: jason[i][j].duration
                            });
                        }
                    }
                   var meta = JSON.stringify(temp);
            name += counter;
            counter++;
            console.log(name);
            add_single_trace(address, name, meta, body);
                });
            }).on('error', function(e){
                console.log("Error: ", e);
            });
        }));
    }
    return res.status(200).json({
        started: true
    });
});


function add_single_trace(contract_address, name, metadata, data) {
    const from = account.account;
    const gas = 1000000;
    const gasPrice = 18000000000;
    const address = contract_address !== undefined ? contract_address : auditchain.getAuditChainAddress();
    if (address === undefined || address.length !== 42) {
        return false;
    }
    const traceStringArray = [];
    traceStringArray.push([name, 0, metadata]);
    if (data.length > 255000) {
        return false;
    }
    let j = 1;
    for (let i = 0; i < data.length; i+= 1000) {
        traceStringArray.push([name, j, data.substring(i, i + 1000 < data.length ? i + 1000 : data.length)]);
        j ++;
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
            console.log(receipt);
            if (_receipt.status === "0x0") {
                return false;
            } else {
                receiptList.push(receipt);
            }
        }
    }, function onError(error) {
        console.log(error);
    });
}


module.exports = router;
