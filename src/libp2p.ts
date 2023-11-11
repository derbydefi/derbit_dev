import { Libp2p, createLibp2p } from "libp2p";
import { multiaddr, Multiaddr } from "multiaddr";
// import { noise } from "@chainsafe/libp2p-noise";
// import { mplex } from "@libp2p/mplex";
// import { tcp } from "@libp2p/tcp";
const { tcp } = require("@libp2p/tcp");
const { noise } = require("@chainsafe/libp2p-noise");
const { mplex } = require("@libp2p/mplex");
import Block from "./Block";
import User from "./User";

interface IStream {
  source: AsyncIterable<Uint8Array>;
  write: (data: string) => void;
  close: () => Promise<void>;
}

interface ILibp2pNode {
  start: () => Promise<void>;
  stop: () => Promise<void>;
  on: (event: string, callback: (peerId: any) => void) => void;
  handle: (protocol: string, handler: (param: { stream: IStream }) => Promise<void>) => void;
  dial: (address: Multiaddr) => Promise<void>;
  dialProtocol: (peerId: any, protocol: string) => Promise<{ stream: IStream }>;
}

export default class P2PNetwork {
  private user: User;
  private libp2pNode: ILibp2pNode;

  constructor(user: User) {
    this.user = user;

    this.libp2pNode = createLibp2p({
      addresses: {
        listen: ["/ip4/0.0.0.0/tcp/0"], // listen on all IPv4 interfaces
      },
      transports: [new tcp()],
      connectionEncryption: [new noise()],
      streamMuxers: [new mplex()],
      // Other options and configurations as needed
    }) as unknown as ILibp2pNode;
  }

  async start(): Promise<void> {
    await this.libp2pNode.start();
    console.log("libp2p has started");

    this.libp2pNode.on("peer:discovery", (peerId) => {
      console.log("Discovered:", peerId.toB58String());
    });

    this.libp2pNode.handle("/data/1.0.0", async ({ stream }) => {
      console.log("Received a new stream");
      // ...stream handling logic...
    });
  }

  async stop(): Promise<void> {
    await this.libp2pNode.stop();
    console.log("libp2p has stopped");
  }

  async connectToPeer(peerAddress: string): Promise<void> {
    const ma = multiaddr(peerAddress);
    await this.libp2pNode.dial(ma);
    console.log(`Connected to ${peerAddress}`);
  }

  async sendBlock(block: Block, recipientPeerId: string): Promise<void> {
    const { stream } = await this.libp2pNode.dialProtocol(recipientPeerId, "/data/1.0.0");
    const data = block.serialize();
    stream.write(data);
    console.log("Sent block to peer:", recipientPeerId);
    await stream.close();
  }

  async receiveBlock(stream: IStream): Promise<void> {
    let data = "";
    for await (const chunk of stream.source) {
      data += chunk.toString();
    }
    const block = Block.deserialize(data);
    console.log("Received block:", block);
  }

  // More methods related to p2p networking can be added here
}
