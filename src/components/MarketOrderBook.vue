<template>
  <div>

    <div class="trading-section">
      <div class="chart-container">
        <p class="latest-price">Latest Price: {{latestPrice}} {{quoteAsset}}</p>
        <h3>K-Line Chart ({{ baseAsset }}/ {{quoteAsset}})</h3>
        <canvas id="klineChart"></canvas>
      </div>

      <div class="orderbook-container">
        <h3>Order Book</h3>

        <h4>Asks</h4>
        <table class="orderbook-table ask">
          <thead>
          <tr>
            <th>Price ({{ quoteAsset }})</th>
            <th>Amount ({{ baseAsset }})</th>
            <th>Volume Bar</th>
            <th>Total ({{ quoteAsset }})</th>
          </tr>
          </thead>
          <tbody>
          <tr v-for="(ask, index) in askSide.slice().reverse()" :key="'ask-' + index">
            <td>{{ ask.price.toFixed(2) }}</td>
            <td>{{ ask.volume.toFixed(4) }}</td>
            <td>
              <div
                  class="volume-bar"
                  :style="{ width: `${(ask.volume / maxAskVolume) * 100}px` }"
              ></div>
            </td>
            <td>{{ (ask.price * ask.volume).toFixed(2) }}</td>
          </tr>
          </tbody>
        </table>

        <h4>Bids</h4>
        <table class="orderbook-table bid">
          <thead>
          <tr>
            <th>Price ({{ quoteAsset }})</th>
            <th>Amount ({{ baseAsset }})</th>
            <th>Volume Bar</th>
            <th>Total ({{ quoteAsset }})</th>
          </tr>
          </thead>
          <tbody>
          <tr v-for="(bid, index) in bidSide" :key="'bid-' + index">
            <td>{{ bid.price.toFixed(2) }}</td>
            <td>{{ bid.volume.toFixed(4) }}</td>
            <td>
              <div
                  class="volume-bar"
                  :style="{ width: `${(bid.volume / maxBidVolume) * 100}px` }"
              ></div>
            </td>
            <td>{{ (bid.price * bid.volume).toFixed(2) }}</td>
          </tr>
          </tbody>
        </table>
      </div>


      <div class="order-form-container">
        <h3>Place Order <b>({{activeTab}})</b></h3>

        <div class="tab-bar">
          <div
              class="tab"
              :class="{ active: activeTab === 'limit' }"
              @click="activeTab = 'limit'">Limit</div>
          <div
              class="tab"
              :class="{ active: activeTab === 'market' }"
              @click="activeTab = 'market'">Market</div>
        </div>

        <!-- Limit Order -->
        <div v-show="activeTab === 'limit'" class="tab-content">
          <label for="limit-price">Price ({{ quoteAsset }}):</label>
          <input
              id="limit-price"
              type="number"
              v-model="limitPrice"
              placeholder="Enter price"
              step="0.01">

          <label for="limit-amount">Amount ({{ baseAsset }}):</label>
          <input
              id="limit-amount"
              type="number"
              v-model="limitAmount"
              placeholder="Enter amount"
              step="0.00001">

          <div class="button-group">
            <button @click="placeLimitOrder('buy')" class="buy-btn">Buy</button>
            <button @click="placeLimitOrder('sell')" class="sell-btn">Sell</button>
          </div>
        </div>

        <!-- Market Order -->
        <div v-show="activeTab === 'market'" class="tab-content">

          <label for="sell-size">Sell Size ({{ baseAsset }}):</label>
          <input
              id="sell-size"
              type="number"
              v-model="marketSellSize"
              placeholder="Enter Sell Size"
              step="0.00001">

          <label for="Buy-amount">Buy Amount ({{ quoteAsset }}):</label>

          <input
              id="buy-amount"
              type="number"
              v-model="marketBuyAmount"
              placeholder="Enter Buy amount"
              step="0.00001">

          <div class="button-group">
            <button @click="placeMarketOrder('buy')" class="buy-btn">Buy</button>
            <button @click="placeMarketOrder('sell')" class="sell-btn">Sell</button>
          </div>
        </div>

        <div class="balance-section">
          <h3>Base Balance ({{ baseAsset }}): {{baseBalance}}</h3>
          <h3>Quote Balance ({{ quoteAsset }}): {{quoteBalance}}</h3>
        </div>

      </div>


    </div>
    <div>
      <h3>Open Orders</h3>
      <table class="orders-table">
        <thead>
        <tr>
          <th>Order ID</th>
          <th>Type</th>
          <th>Side</th>
          <th>Price ({{ quoteAsset }})</th>
          <th>Original Size ({{ baseAsset }})</th>
          <th>Filled ({{ baseAsset }})</th>
          <th>Status</th>
          <th>Cancel</th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="(order, index) in openOrders" :key="'open-' + index">
          <td>{{ order.id }}</td>
          <td>{{ order.type === 0 ? 'LIMIT' : 'MARKET' }}</td>
          <td>{{ order.side === 0 ? 'BUY' : 'SELL' }}</td>
          <td>{{ order.price == undefined ? '-' : order.price }}</td>
          <td>{{ order.original_size }}</td>
          <td>{{ order.original_size - order.remaining_size }}</td>
          <td>{{ order.status }}</td>
          <td>
            <button @click="cancelOrder(order.id)">X</button>
          </td>
        </tr>
        </tbody>
      </table>
    </div>

    <div>
      <h3>Order History</h3>
      <table class="orders-table">
        <thead>
        <tr>
          <th>Order ID</th>
          <th>Type</th>
          <th>Side</th>
          <th>Price ({{ quoteAsset }})</th>
          <th>Amount ({{ baseAsset }})</th>
          <th>Average Price ({{ quoteAsset }})</th>
          <th>Fees</th>
          <th>Fee Asset</th>
          <th>Status</th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="(order, index) in orderHistory" :key="'history-' + index">
          <td>{{ order.id }}</td>
          <td>{{ order.type === 0 ? 'LIMIT' : 'MARKET' }}</td>
          <td>{{ order.side === 0 ? 'BUY' : 'SELL' }}</td>
          <td>{{ order.price == undefined ? order.avg_dealt_price : order.price }}</td>
          <td>{{ order.original_size }}</td>
          <td>{{ order.avg_dealt_price }}</td>
          <td>{{ order.fees }}</td>
          <td>{{ order.fee_asset }}</td>
          <td>{{ order.status }}</td>
        </tr>
        </tbody>
      </table>
    </div>

    <div class="cmd-window" id="cmdOutput">
      C:\CryptoEx> trading {{baseAsset}}/{{quoteAsset}}<br>
      Enter order details to trade<br>
      C:\CryptoEx> _
    </div>
    <div class="footer">
      CryptoEx Pixel © 2025 - All Rights Reserved
    </div>
  </div>
</template>


<script>
import { authUtils } from '@/services/auth'
import {walletAPI, orderBooksAPI, ordersAPI} from '@/services/apiService'

export default {
  name: 'MarketOrderBook',
  emits: ['navigate', 'logout'],
  data() {
    return {
      latestPrice: 0.0,
      openOrders: [],
      orderHistory: [],
      activeTab: 'limit',
      market: "",
      baseAsset: "",
      quoteAsset: "",
      baseBalance: "",
      quoteBalance: "",
      limitPrice: 0.0,
      limitAmount: 0.0,
      marketSellSize: 0.0,
      marketBuyAmount: 0.0,
      balances: [],
      bidSide: [],
      askSide: [],
      maxBidVolume: 1,
      maxAskVolume: 1,
    };
  },

  async mounted() {
    const marketName = this.$route.params.marketName // 從路由中取得參數
    if (!marketName) {
      console.error('No market name in route')
      return
    }

    this.market = marketName
    var assets = marketName.split('-')
    this.baseAsset = assets[0]
    this.quoteAsset = assets[1]

    await this.fetchOrderBook()
    await this.fetchOpenOrders()
    await this.fetchClosedOrders()
    await this.fetchBalances()
    this.startAutoRefresh()
  },


  computed: {
    totalAssets() {
      return this.balances.length
    },
    nonZeroBalances() {
      return this.balances.filter(balance => balance.total > 0).length
    }
  },

  beforeUnmount() {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval)
    }
  },
  methods: {
    async cancelOrder(orderId) {
      try {
        // 檢查是否已登入
        if (!authUtils.isAuthenticated()) {
          return
        }

        const response = await ordersAPI.cancelOrder(orderId)

        if (response.data.code === '0000000') {
          alert("order canceled")
          this.fetchOpenOrders()
          this.fetchClosedOrders()
          this.refreshBalances()
        } else {
          throw new Error(response.data.message || 'failed cancel')
        }
      } catch (error) {
        this.error = error.response?.data?.message || error.message || 'Network error occurred'
        console.error('failed cancel:', error)
      } finally {
        this.loading = false
      }
    },

    async fetchOpenOrders() {
      try {
        // 檢查是否已登入
        if (!authUtils.isAuthenticated()) {
          return
        }

        const response = await ordersAPI.getOpenOrders(this.market)

        if (response.data.code === '0000000') {
          this.openOrders = response.data.data.result
          console.log(this.openOrders)
        } else {
          throw new Error(response.data.message || 'Failed to fetch open orders')
        }
      } catch (error) {
        this.error = error.response?.data?.message || error.message || 'Network error occurred'
        console.error('Error fetching orders:', error)
      } finally {
        this.loading = false
      }
    },

    async fetchClosedOrders() {
      try {
        // 檢查是否已登入
        if (!authUtils.isAuthenticated()) {
          return
        }

        const response = await ordersAPI.getClosedOrders(this.market)

        if (response.data.code === '0000000') {
          this.orderHistory = response.data.data.result
          console.log(this.orderHistory)
        } else {
          throw new Error(response.data.message || 'Failed to fetch open orders')
        }
      } catch (error) {
        this.error = error.response?.data?.message || error.message || 'Network error occurred'
        console.error('Error fetching orders:', error)
      } finally {
        this.loading = false
      }
    },

    async placeLimitOrder(side) {
      if (side === 'buy') {
        await ordersAPI.placeLimitBuyOrder(this.market, this.limitPrice, this.limitAmount)
      } else {
        await ordersAPI.placeLimitSellOrder(this.market, this.limitPrice, this.limitAmount)
      }

      alert("limit order placed!")
      this.fetchOpenOrders()
      this.fetchClosedOrders()
      this.refreshBalances()
    },

    async placeMarketOrder(side) {
      if (side === 'buy') {
        await ordersAPI.placeMarketBuyOrder(this.market, this.marketBuyAmount)
      } else {
        await ordersAPI.placeMarketSellOrder(this.market, this.marketSellSize)
      }

      alert("market order placed!")
      this.fetchOpenOrders()
      this.fetchClosedOrders()
      this.refreshBalances()
    },

    async fetchOrderBook() {
      try {
        const res = await orderBooksAPI.getOrderBook(this.market);
        const data = res.data.data;

        this.latestPrice = data.latest_price;

        this.bidSide = data.bid_side;
        this.askSide = data.ask_side;

        // 計算最大量，用於 bar 寬度百分比
        this.maxBidVolume = Math.max(...this.bidSide.map((b) => b.volume));
        this.maxAskVolume = Math.max(...this.askSide.map((a) => a.volume));
      } catch (error) {
        console.error("Failed to fetch order book:", error);
      }
    },

    async fetchBalances() {
      this.loading = true
      this.error = null

      try {
        // 檢查是否已登入
        if (!authUtils.isAuthenticated()) {
          return
        }

        const response = await walletAPI.getBalances()

        if (response.data.code === '0000000') {
          this.balances = response.data.data

          this.balances.forEach(b => {
            console.log(b)
            if (b.asset === this.baseAsset) {
              this.baseBalance = parseFloat(b.total).toFixed(4); // 顯示小數點後 4 位
            }
            if (b.asset === this.quoteAsset) {
              this.quoteBalance = parseFloat(b.total).toFixed(2); // 顯示小數點後 2 位
            }
          })

          this.lastUpdated = new Date().toLocaleTimeString()
        } else {
          throw new Error(response.data.message || 'Failed to fetch balances')
        }
      } catch (error) {
        this.error = error.response?.data?.message || error.message || 'Network error occurred'
        console.error('Error fetching balances:', error)
      } finally {
        this.loading = false
      }
    },

    async refreshBalances() {
      await this.fetchBalances()
    },

    formatAmount(amount) {
      if (amount === 0) return '0.00000000'
      if (amount < 0.00000001) return '< 0.00000001'
      return parseFloat(amount).toFixed(8)
    },

    getStatusClass(balance) {
      if (balance.total === 0) return 'status-empty'
      if (balance.locked > 0) return 'status-locked'
      return 'status-available'
    },

    getStatusText(balance) {
      if (balance.total === 0) return 'Empty'
      if (balance.locked > 0) return 'Locked'
      return 'Available'
    },

    formatBalancesForCmd() {
      const cmdData = {
        summary: {
          totalAssets: this.totalAssets,
          nonZeroBalances: this.nonZeroBalances,
          timestamp: new Date().toISOString()
        },
        balances: this.balances.map(balance => ({
          asset: balance.asset,
          available: balance.available,
          locked: balance.locked,
          total: balance.total
        }))
      }
      return JSON.stringify(cmdData, null, 2)
    },

    startAutoRefresh() {
      this.refreshInterval = setInterval(() => {
        //this.fetchBalances()
        this.fetchOrderBook()
      },1000) // 每5秒更新一次
    },

  }
}
</script>

<style>
body {
  background: linear-gradient(180deg, #ff66cc, #9900cc);
  font-family: 'Press Start 2P', cursive;
  color: #ffffff;
  margin: 0;
  padding: 20px;
  background-image: url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAQAAAAECAYAAACp8Z5+AAAAG0lEQVR4AWMAAv+BAgICAgICiAECAwICAgICAgICBtgBc4AAAAASUVORK5CYII=');
  background-repeat: repeat;
}
.container {
  background: rgba(51, 0, 51, 0.8);
  border: 3px solid #ff99ff;
  width: 900px;
  margin: 50px auto;
  padding: 15px;
  box-shadow: 0 0 10px #ff66cc, 0 0 20px #9900cc;
  border-radius: 5px;
}
.title-bar {
  background: linear-gradient(90deg, #ff33cc, #cc00ff);
  color: #ffffff;
  padding: 8px;
  font-size: 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border: 2px solid #ff99ff;
  text-shadow: 1px 1px 2px #330033;
}
.title-bar button {
  background: #ff66cc;
  border: 2px solid #ff99ff;
  padding: 3px 10px;
  cursor: pointer;
  font-family: 'Press Start 2P', cursive;
  font-size: 10px;
  color: #ffffff;
  text-shadow: 1px 1px #330033;
  transition: all 0.2s;
}
.title-bar button:hover {
  background: #cc00ff;
  box-shadow: 0 0 5px #ff66cc;
}
.nav-bar {
  background: rgba(51, 0, 51, 0.8);
  border: 2px solid #ff99ff;
  padding: 8px;
  margin: 15px 0;
}
.nav-bar a {
  margin-right: 15px;
  color: #ffccff;
  text-decoration: none;
  font-size: 10px;
  text-shadow: 1px 1px #330033;
}
.nav-bar a:hover {
  color: #ff66cc;
  text-shadow: 0 0 5px #ff66cc;
}
.balance-section {
  margin: 15px 0;
  font-size: 10px;
  color: #ffccff;
  text-shadow: 1px 1px #330033;
}
.trading-section {

  display: flex;
  flex-wrap: wrap;
  gap: 15px;
}
.chart-container, .orderbook-container, .order-form-container {
  flex: 1;
  min-width: 280px;
  background: rgba(255, 255, 255, 0.1);
  border: 2px solid #ff99ff;
  padding: 15px;
  box-shadow: inset 0 0 5px #9900cc;
}
.chart-container canvas {
  max-height: 200px;
}
.latest-price {
  font-size: 12px;
  font-weight: bold;
  margin: 5px 0;
  color: #ffccff;
  text-shadow: 1px 1px #330033;
}
.orderbook-container h4 {
  font-size: 10px;
  margin: 5px 0;
  border-bottom: 1px solid #ff99ff;
  color: #ffccff;
  text-shadow: 1px 1px #330033;
}
.orderbook-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 10px;
  margin-bottom: 10px;
  color: #ffccff;
}
.orderbook-table th, .orderbook-table td {
  border: 1px solid #ff99ff;
  padding: 3px;
  text-align: right;
  text-shadow: 1px 1px #330033;
}
.orderbook-table th {
  background: linear-gradient(90deg, #ff33cc, #cc00ff);
  color: #ffffff;
}
.orderbook-table.bid tr {
  background: rgba(0, 255, 0, 0.2);
}
.orderbook-table.ask tr {
  background: rgba(255, 0, 0, 0.2);
}
.volume-bar {
  display: inline-block;
  height: 8px;
  background: #ff66cc;
  border: 1px solid #ff99ff;
}
.order-form-container h3 {
  font-size: 12px;
  margin: 5px 0;
  color: #ffccff;
  text-shadow: 1px 1px #330033;
}
.tab-bar {
  display: flex;
  margin-bottom: 10px;
}
.tab {
  background: #ff66cc;
  border: 2px solid #ff99ff;
  padding: 5px 10px;
  cursor: pointer;
  font-size: 10px;
  color: #ffffff;
  margin-right: 5px;
  text-shadow: 1px 1px #330033;
  transition: all 0.2s;
}
.tab.active {
  background: #cc00ff;
  border: 2px solid #ff99ff;
  box-shadow: 0 0 5px #ff66cc;
  font-weight: bold;
}
.tab-content {

}
.tab-content.active {
  display: block;
}
.order-form-container label {
  display: block;
  font-size: 10px;
  margin: 10px 0 5px;
  color: #ffccff;
  text-shadow: 1px 1px #330033;
}
.order-form-container input {
  width: calc(100% - 14px);
  padding: 6px;
  border: 2px solid #ff99ff;
  background: rgba(255, 255, 255, 0.1);
  font-family: 'Press Start 2P', cursive;
  font-size: 10px;
  color: #ffffff;
  box-shadow: inset 0 0 5px #9900cc;
}
.order-form-container button {
  background: #ff66cc;
  border: 2px solid #ff99ff;
  padding: 6px 12px;
  cursor: pointer;
  font-family: 'Press Start 2P', cursive;
  font-size: 10px;
  color: #ffffff;
  width: 48%;
  margin: 10px 5px 0 0;
  box-shadow: 0 0 5px #ff66cc;
  text-shadow: 1px 1px #330033;
  transition: all 0.2s;
}
.order-form-container button:hover {
  background: #cc00ff;
  box-shadow: 0 0 8px #ff66cc;
}
.buy-btn {
  background: #00cc00;
}
.sell-btn {
  background: #cc0000;
}
.orders-table {
  width: 100%;
  border-collapse: collapse;
  background: rgba(255, 255, 255, 0.1);
  border: 2px solid #ff99ff;
  margin: 15px 0;
  font-size: 7px;
  color: #ffccff;
}
.orders-table th, .orders-table td {
  border: 1px solid #ff99ff;
  padding: 5px;
  text-align: left;
  text-shadow: 1px 1px #330033;
}
.orders-table th {
  background: linear-gradient(90deg, #ff33cc, #cc00ff);
  color: #ffffff;
}
.cmd-window {
  background: #1a001a;
  color: #ff66cc;
  font-family: 'Courier New', monospace;
  padding: 12px;
  margin: 15px 0;
  border: 2px solid #ff99ff;
  height: 150px;
  overflow-y: auto;
  box-shadow: inset 0 0 10px #9900cc;
  font-size: 12px;
}
.footer {
  text-align: center;
  font-size: 8px;
  color: #ffccff;
  margin-top: 15px;
  text-shadow: 1px 1px #330033;
}


</style>