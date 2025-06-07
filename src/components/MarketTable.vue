<template>
  <table class="market-table">
    <thead>
    <tr>
      <th>Trading Pair</th>
      <th>Price (USDT)</th>
      <th>24h Change</th>
      <th>Volume</th>
    </tr>
    </thead>
    <tbody>
    <tr v-for="market in markets" :key="market.market_name" @click="selectMarket(market)">
      <td>{{ market.market_name }}</td>
      <td>{{ formatPrice(market.latest_price) }}</td>
      <td :style="{ color: market.price_change_24h >= 0 ? '#00ff99' : '#ff3366' }">
        {{ formatChange(market.price_change_24h) }}
      </td>
      <td>{{ formatVolume(market.total_volume_24h) }}</td>
    </tr>
    </tbody>
  </table>
</template>

<script>
export default {
  name: 'MarketTable',
  props: {
    markets: {
      type: Array,
      default: () => []
    }
  },
  methods: {
    formatPrice(price) {
      return new Intl.NumberFormat('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 8
      }).format(price)
    },

    formatChange(change) {
      const sign = change >= 0 ? '+' : ''
      return `${sign}${(change * 100).toFixed(2)}%`
    },

    formatVolume(volume) {
      if (volume >= 1000000) {
        return `${(volume / 1000000).toFixed(2)}M`
      } else if (volume >= 1000) {
        return `${(volume / 1000).toFixed(2)}K`
      }
      return volume.toFixed(2)
    },

    selectMarket(market) {
      this.$emit('market-selected', market)
    }
  }
}
</script>

<style scoped>
.market-table {
  width: 100%;
  border-collapse: collapse;
  background: rgba(255, 255, 255, 0.1);
  border: 2px solid #ff99ff;
  margin: 15px 0;
}

.market-table th, .market-table td {
  border: 1px solid #ff66cc;
  padding: 8px;
  text-align: left;
  font-size: 10px;
  color: #ffffff;
}

.market-table th {
  background: linear-gradient(90deg, #cc00ff, #ff33cc);
  text-shadow: 1px 1px #330033;
}

.market-table tbody tr {
  cursor: pointer;
  transition: background-color 0.2s;
}

.market-table tbody tr:hover {
  background: rgba(255, 102, 204, 0.2);
}
</style>