const express = require('express');
const path = require('path');
const favicon = require('serve-favicon');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');

const index = require('./routes/index');
const unlockCoinbaseAccount = require('./routes/unlock-coinbase-account');
const createContract = require('./routes/create-contract');
const sendFunctionCall = require('./routes/send-function-call');
const sendFunctionTransaction = require('./routes/send-function-transaction');
const addTraceData = require('./routes/add-trace-data');
const queryTraceData = require('./routes/query-trace-data');
const pollStart = require('./routes/zipkin-poll-start');
const pollStop = require('./routes/zipkin-poll-stop');
const getAllTraces = require('./routes/get-all-traces');
const getAllBlocks = require('./routes/get-all-blocks');
const getTransInBlock = require('./routes/get-transactions-in-block');
const createAuditChain = require('./routes/create-auditchain');

const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', index);
app.use('/unlock_coinbase_account', unlockCoinbaseAccount);
app.use(('/create_contract'), createContract);
app.use(('/send_function_call'), sendFunctionCall);
app.use(('/send_function_transaction'), sendFunctionTransaction);
app.use(('/add_trace_data'), addTraceData);
app.use(('/query_trace_data'), queryTraceData);
app.use(('/create_auditchain'), createAuditChain);
app.use(('/ziplin_poll_start'), pollStart);
app.use(('/ziplin_poll_stop'), pollStop);
app.use(('/get_all_traces'), getAllTraces);
app.use(('/get_all_blocks'), getAllBlocks);
app.use(('/get_transactions_in_block'), getTransInBlock);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    const err = new Error('Not Found');
    err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});
var server = app.listen(3010, function () {

var host = server.address().address
var port = server.address().port

console.log("Example app listening at http://%s:%s", host, port)

})
module.exports = app;
