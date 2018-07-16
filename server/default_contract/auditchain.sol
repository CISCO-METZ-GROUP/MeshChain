pragma solidity ^0.4.0;
// We have to specify what version of compiler this code will compile with

contract AuditChain {
    string[] traces;
    mapping(string => Value[256]) nameBST;

    struct Value {
        uint8 left;
        uint8 right;
        uint256 traceNo;
        bool inserted;
    }

    function insert(Value[256] storage bst, uint8 root, uint8 order) private returns (bool) {
        if (root > order) {
            if (bst[root].left == 0) {
                bst[root].left = order;
                return true;
            } else {
                return insert(bst, bst[root].left, order);
            }
        } else if (root < order) {
            if (bst[root].right == 0) {
                bst[root].right = order;
                return true;
            } else {
                return insert(bst, bst[root].right, order);
            }
        } else {
            return false;
        }
    }

    function getTraceNos(string name)
    public
    view
    returns (uint256[]) {
        Value[256] storage bst = nameBST[name];
        uint8[] memory stack = new uint8[](256);
        uint256[] memory traceNos = new uint256[](256);
        uint8 current = bst[0].right;
        uint8 stackNo = 0;
        uint8 traceNoLength = 0;
        while (true) {
            if (bst[current].inserted) {
                stack[stackNo] = current;
                stackNo ++;
                current = bst[current].left;
            } else {
                if (stackNo > 0) {
                    current = stack[stackNo - 1];
                    traceNos[traceNoLength] = bst[current].traceNo;
                    traceNoLength ++;
                    stackNo --;
                    current = bst[current].right;
                } else {
                    break;
                }
            }
        }
        uint256[] memory traceNosReturn = new uint256[](traceNoLength);
        for (uint i = 0; i < traceNoLength; i ++) {
            traceNosReturn[i] = traceNos[i];
        }
        return traceNosReturn;
    }

    function addData(string name, uint8 order, string trace)
    public
    returns (bool)
    {
        uint traceNo = traces.length;
        Value[256] storage bst = nameBST[name];
        order ++;
        if (order > 255) {
            return false;
        }
        if (order == 1) {
            if (!bst[order].inserted) {
                NewTrace(name, trace);
            } else {
                return false;
            }
        } else if (bst[order].inserted) {
            return false;
        }
        bst[order].inserted = true;
        bst[order].traceNo = traceNo;
        if (bst[0].right == 0) {
            bst[0].right = order;
            traces.push(trace);
            return true;
        } else {
            if (insert(bst, bst[0].right, order)) {
                traces.push(trace);
                return true;
            } else {
                return false;
            }
        }
    }

    // function to get trace given its name
    function getTrace(uint256 traceNo)
    view
    public
    returns (string) {
        if (traceNo < traces.length) {
            return traces[traceNo];
        } else {
            return "";
        }
    }

    // function to get current trace count;
    function currNumber()
    view
    public
    returns (uint) {
        return traces.length;
    }

    // event to be called when adding new trace
    event NewTrace (string name, string metadata);
}
