"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const libp2p_1 = require("libp2p");
const multiaddr_1 = require("multiaddr");
// import { noise } from "@chainsafe/libp2p-noise";
// import { mplex } from "@libp2p/mplex";
// import { tcp } from "@libp2p/tcp";
const { tcp } = require("@libp2p/tcp");
const { noise } = require("@chainsafe/libp2p-noise");
const { mplex } = require("@libp2p/mplex");
const Block_1 = __importDefault(require("./Block"));
class P2PNetwork {
    constructor(user) {
        this.user = user;
        this.libp2pNode = (0, libp2p_1.createLibp2p)({
            addresses: {
                listen: ["/ip4/0.0.0.0/tcp/0"], // listen on all IPv4 interfaces
            },
            transports: [new tcp()],
            connectionEncryption: [new noise()],
            streamMuxers: [new mplex()],
            // Other options and configurations as needed
        });
    }
    start() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.libp2pNode.start();
            console.log("libp2p has started");
            this.libp2pNode.on("peer:discovery", (peerId) => {
                console.log("Discovered:", peerId.toB58String());
            });
            this.libp2pNode.handle("/data/1.0.0", ({ stream }) => __awaiter(this, void 0, void 0, function* () {
                console.log("Received a new stream");
                // ...stream handling logic...
            }));
        });
    }
    stop() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.libp2pNode.stop();
            console.log("libp2p has stopped");
        });
    }
    connectToPeer(peerAddress) {
        return __awaiter(this, void 0, void 0, function* () {
            const ma = (0, multiaddr_1.multiaddr)(peerAddress);
            yield this.libp2pNode.dial(ma);
            console.log(`Connected to ${peerAddress}`);
        });
    }
    sendBlock(block, recipientPeerId) {
        return __awaiter(this, void 0, void 0, function* () {
            const { stream } = yield this.libp2pNode.dialProtocol(recipientPeerId, "/data/1.0.0");
            const data = block.serialize();
            stream.write(data);
            console.log("Sent block to peer:", recipientPeerId);
            yield stream.close();
        });
    }
    receiveBlock(stream) {
        var _a, e_1, _b, _c;
        return __awaiter(this, void 0, void 0, function* () {
            let data = "";
            try {
                for (var _d = true, _e = __asyncValues(stream.source), _f; _f = yield _e.next(), _a = _f.done, !_a; _d = true) {
                    _c = _f.value;
                    _d = false;
                    const chunk = _c;
                    data += chunk.toString();
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (!_d && !_a && (_b = _e.return)) yield _b.call(_e);
                }
                finally { if (e_1) throw e_1.error; }
            }
            const block = Block_1.default.deserialize(data);
            console.log("Received block:", block);
        });
    }
}
exports.default = P2PNetwork;
