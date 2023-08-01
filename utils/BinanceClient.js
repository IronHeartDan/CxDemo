import Binance from "ltt-binance-api-react-native"

const URL = "https://testnet.binancefuture.com"
const WS = "wss://testnet.binancefuture.com/ws"
const apiKey = '0410e1783cfcbbf8d79ce965a7a6a276a91e8a9d1c52cc000cdd1c283a4a485c'
const apiSecret = 'a59d8169920b36d7e2e184edabb5baf268a078c89a192837ff9111a65652b558'

const binanceClient = Binance({
    apiKey: apiKey,
    apiSecret: apiSecret,
    httpFutures: URL,
    wsFutures: WS
  });
  

// const binanceClient = Binance();

export default binanceClient