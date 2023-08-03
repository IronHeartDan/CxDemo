export type OrderTradeUpdateEvent = {
    e: string
    E: number
    o: StreamOrder
}

export type StreamOrder = {
    s: string
    c: string
    S: string
    o: string
    f: string
    q: string
    p: string
    ap: string
    sp: string
    x: string
    X: string
    i: number
    l: string
    z: string
    L: string
    N?: string
    n?: string
    T: number
    t: number
    b: string
    a: string
}

export type StreamPosition = {
    s: string
    pa: number
    ep: number
    cr: number
}

export type Order = {
    orderId: number
    symbol: string
    status: string
    clientOrderId: string
    price: string
    avgPrice: string
    origQty: string
    executedQty: string
    cumQuote: string
    timeInForce: string
    type: string
    reduceOnly: boolean
    closePosition: boolean
    side: string
    positionSide: string
    stopPrice: string
    workingType: string
    priceProtect: boolean
    origType: string
    time: number
    updateTime: number
}


// export type Position = {
//     symbol: string
//     positionAmt: string
//     entryPrice: string
//     markPrice: string
//     unRealizedProfit: string
//     liquidationPrice: string
//     leverage: string
//     maxNotionalValue: string
//     marginType: string
//     isolatedMargin: string
//     isAutoAddMargin: string
//     positionSide: string
//     notional: string
//     isolatedWallet: string
//     updateTime: number
// }

export type Ticker = {
    e: string
    E: number
    s: string
    p: string
    P: string
    w: string
    c: string
    Q: string
    o: string
    h: string
    l: string
    v: string
    q: string
    O: number
    C: number
    F: number
    L: number
    n: number
}

export type MarkPrice = {
    e: string
    E: number
    s: string
    p: string
    i: string
    P: string
    r: string
    T: number
}

export type TradeData = {
    aggId: number;
    symbol: string;
    price: string;
    quantity: string;
    firstId: number;
    lastId: number;
    timestamp: number;
    isBuyerMaker: boolean;
}

export type StreamTradeData = {
    e: string;
    E: number;
    s: string;
    p: string;
    q: string;
    f: number;
    l: number;
    T: number;
    m: boolean;
}

export type Asset = {
    asset: string;
    walletBalance: string;
    unrealizedProfit: string;
    marginBalance: string;
    maintMargin: string;
    initialMargin: string;
    positionInitialMargin: string;
    openOrderInitialMargin: string;
    maxWithdrawAmount: string;
    crossWalletBalance: string;
    crossUnPnl: string;
    availableBalance: string;
    marginAvailable: boolean;
    updateTime: number;
};

export type Position = {
    symbol: string;
    initialMargin: string;
    maintMargin: string;
    unrealizedProfit: string;
    positionInitialMargin: string;
    openOrderInitialMargin: string;
    leverage: string;
    isolated: boolean;
    entryPrice: string;
    maxNotional: string;
    positionSide: string;
    positionAmt: string;
    notional: string;
    isolatedWallet: string;
    updateTime: number;
    bidNotional: string;
    askNotional: string;
};

export type AccountInfo = {
    feeTier: number;
    canTrade: boolean;
    canDeposit: boolean;
    canWithdraw: boolean;
    updateTime: number;
    multiAssetsMargin: boolean;
    totalInitialMargin: string;
    totalMaintMargin: string;
    totalWalletBalance: string;
    totalUnrealizedProfit: string;
    totalMarginBalance: string;
    totalPositionInitialMargin: string;
    totalOpenOrderInitialMargin: string;
    totalCrossWalletBalance: string;
    totalCrossUnPnl: string;
    availableBalance: string;
    maxWithdrawAmount: string;
    assets: Asset[];
    positions: Position[];
};