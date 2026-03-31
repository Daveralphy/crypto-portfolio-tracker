/**
 * Get mock coin data for testing/development (CORS fallback)
 * @returns {Array} Array of mock coin data
 */
export function getMockCoins() {
  return [
    {
      id: 'bitcoin',
      name: 'Bitcoin',
      symbol: 'BTC',
      current_price: 43250.00,
      price_change_percentage_24h: 2.34,
      market_cap: 850000000000,
      image: 'https://assets.coingecko.com/coins/images/1/large/bitcoin.png'
    },
    {
      id: 'ethereum',
      name: 'Ethereum',
      symbol: 'ETH',
      current_price: 2280.50,
      price_change_percentage_24h: 1.85,
      market_cap: 273000000000,
      image: 'https://assets.coingecko.com/coins/images/279/large/ethereum.png'
    },
    {
      id: 'tether',
      name: 'Tether',
      symbol: 'USDT',
      current_price: 1.00,
      price_change_percentage_24h: 0.05,
      market_cap: 90000000000,
      image: 'https://assets.coingecko.com/coins/images/325/large/Tether.png'
    },
    {
      id: 'binancecoin',
      name: 'Binance Coin',
      symbol: 'BNB',
      current_price: 610.25,
      price_change_percentage_24h: 3.12,
      market_cap: 93000000000,
      image: 'https://assets.coingecko.com/coins/images/825/large/binance-coin-logo.png'
    },
    {
      id: 'solana',
      name: 'Solana',
      symbol: 'SOL',
      current_price: 198.75,
      price_change_percentage_24h: 4.20,
      market_cap: 87000000000,
      image: 'https://assets.coingecko.com/coins/images/4128/large/solana.png'
    },
    {
      id: 'ripple',
      name: 'Ripple',
      symbol: 'XRP',
      current_price: 2.45,
      price_change_percentage_24h: -1.23,
      market_cap: 135000000000,
      image: 'https://assets.coingecko.com/coins/images/44/large/xrp-symbol-white-128.png'
    },
    {
      id: 'cardano',
      name: 'Cardano',
      symbol: 'ADA',
      current_price: 0.98,
      price_change_percentage_24h: 2.15,
      market_cap: 35000000000,
      image: 'https://assets.coingecko.com/coins/images/975/large/cardano.png'
    },
    {
      id: 'dogecoin',
      name: 'Dogecoin',
      symbol: 'DOGE',
      current_price: 0.35,
      price_change_percentage_24h: 5.67,
      market_cap: 50000000000,
      image: 'https://assets.coingecko.com/coins/images/5/large/dogecoin.png'
    }
  ];
}

/**
 * Fetch cryptocurrency data from CoinGecko API
 * @param {number} limit - Number of coins to fetch (default: 50)
 * @returns {Promise<Array>} Array of coin data
 */
export async function fetchCoins(limit = 50) {
  try {
    const url = `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=${limit}&sparkline=false&price_change_percentage=24h`;
    
    const response = await fetch(url);
    if (!response.ok) throw new Error('Failed to fetch cryptocurrency data');
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching coins:', error);
    console.warn('Using mock data as fallback');
    return getMockCoins();
  }
}

/**
 * Transform raw API data into cleaner format
 * @param {Array} coins - Raw coin data from API
 * @returns {Array} Cleaned coin data
 */
export function formatCoinData(coins) {
  return coins.map(coin => ({
    id: coin.id,
    name: coin.name,
    symbol: coin.symbol.toUpperCase(),
    price: coin.current_price,
    priceChange24h: coin.price_change_percentage_24h,
    marketCap: coin.market_cap,
    image: coin.image
  }));
}

/**
 * Get mock global market data for testing/development (CORS fallback)
 * @returns {Object} Mock global market data
 */
export function getMockGlobalData() {
  return {
    totalMarketCap: 2370000000000, // $2.37T
    btcDominance: 56.03,
    total24hVolume: 85000000000, // $85B
    marketCapChange24h: 1.20
  };
}

/**
 * Fetch global market data from CoinGecko API
 * @returns {Promise<Object>} Global market data including market cap, BTC dominance, volume
 */
export async function fetchGlobalData() {
  try {
    const url = 'https://api.coingecko.com/api/v3/global';
    
    const response = await fetch(url);
    if (!response.ok) throw new Error('Failed to fetch global market data');
    
    const data = await response.json();
    return {
      totalMarketCap: data.data.total_market_cap.usd,
      btcDominance: data.data.market_cap_percentage.btc,
      total24hVolume: data.data.total_volume.usd,
      marketCapChange24h: data.data.market_cap_change_percentage_24h_usd
    };
  } catch (error) {
    console.error('Error fetching global data:', error);
    console.warn('Using mock global data as fallback');
    return getMockGlobalData();
  }
}
