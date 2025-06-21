<template>
  <div class="kline-chart">
    <div class="chart-controls">
      <div class="control-group">
        <label>Market:</label>
        <select v-model="selectedMarket" @change="onMarketChange">
          <option value="ETH-USDT">ETH-USDT</option>
          <option value="BTC-USDT">BTC-USDT</option>
          <option value="DOT-USDT">DOT-USDT</option>
        </select>
      </div>
      <div class="control-group">
        <label>Interval:</label>
        <select v-model="selectedInterval" @change="onIntervalChange">
          <option value="15m">15m</option>
          <option value="1h">1h</option>
          <option value="1d">1d</option>
          <option value="1w">1w</option>
        </select>
      </div>
      <div class="status">
        <span :class="['connection-status', wsConnected ? 'connected' : 'disconnected']">
          {{ wsConnected ? 'Connected' : 'Disconnected' }}
        </span>
      </div>
    </div>
    <div ref="chartContainer" class="chart-wrapper"></div>
  </div>
</template>

<script>
import { createChart } from 'lightweight-charts';

export default {
  name: 'KlineChart',
  props: {
    market: {
      type: String,
      default: 'ETH-USDT'
    },
    interval: {
      type: String,
      default: '15m'
    },
    apiBaseUrl: {
      type: String,
      default: '/api/v1'
    },
    wsUrl: {
      type: String,
      default: 'ws://localhost:8081/ws'
    }
  },
  data() {
    return {
      chart: null,
      candlestickSeries: null,
      volumeSeries: null,
      ws: null,
      wsConnected: false,
      selectedMarket: this.market,
      selectedInterval: this.interval,
      historicalData: [],
      isLoading: false
    };
  },
  mounted() {
    this.initChart();
    this.loadHistoricalData();
    this.connectWebSocket();
  },
  beforeUnmount() {
    this.cleanup();
  },
  methods: {
    initChart() {
      if (this.$refs.chartContainer) {
        this.chart = createChart(this.$refs.chartContainer, {
          width: this.$refs.chartContainer.clientWidth,
          height: 400,
          layout: {
            background: { color: 'transparent' },
            textColor: '#ffffff',
          },
          grid: {
            vertLines: { color: 'rgba(153, 0, 204, 0.3)' },
            horzLines: { color: 'rgba(153, 0, 204, 0.3)' },
          },
          crosshair: {
            mode: 0,
          },
          rightPriceScale: {
            borderColor: '#ff99ff',
          },
          timeScale: {
            borderColor: '#ff99ff',
            timeVisible: true,
            secondsVisible: false,
          },
        });

        // Add candlestick series
        this.candlestickSeries = this.chart.addCandlestickSeries({
          upColor: '#00ff88',
          downColor: '#ff4444',
          borderDownColor: '#ff4444',
          borderUpColor: '#00ff88',
          wickDownColor: '#ff4444',
          wickUpColor: '#00ff88',
        });

        // Add volume series
        this.volumeSeries = this.chart.addHistogramSeries({
          color: 'rgba(255, 153, 255, 0.3)',
          priceFormat: {
            type: 'volume',
          },
          priceScaleId: '',
          scaleMargins: {
            top: 0.8,
            bottom: 0,
          },
        });

        // Handle window resize
        window.addEventListener('resize', this.handleResize);
      }
    },

    async loadHistoricalData() {
      if (this.isLoading) return;

      this.isLoading = true;
      try {
        const url = `${this.apiBaseUrl}/markets/${this.selectedMarket}/ohlcv-history/${this.selectedInterval}`;
        const response = await fetch(url);
        const result = await response.json();

        if (result.code === '0000000' && result.data.s === 'ok') {
          const data = this.formatHistoricalData(result.data);
          this.historicalData = data.candleData;

          if (this.candlestickSeries && this.volumeSeries) {
            this.candlestickSeries.setData(data.candleData);
            this.volumeSeries.setData(data.volumeData);
          }
        } else {
          console.error('Failed to load historical data:', result.message);
        }
      } catch (error) {
        console.error('Error loading historical data:', error);
      } finally {
        this.isLoading = false;
      }
    },

    formatHistoricalData(data) {
      const candleData = [];
      const volumeData = [];

      for (let i = 0; i < data.t.length; i++) {
        const time = data.t[i];
        const open = data.o[i];
        const high = data.h[i];
        const low = data.l[i];
        const close = data.c[i];
        const volume = data.v[i];

        candleData.push({
          time: time,
          open: open,
          high: high,
          low: low,
          close: close
        });

        volumeData.push({
          time: time,
          value: volume,
          color: close >= open ? 'rgba(0, 255, 136, 0.3)' : 'rgba(255, 68, 68, 0.3)'
        });
      }

      return { candleData, volumeData };
    },

    connectWebSocket() {
      try {
        this.ws = new WebSocket(this.wsUrl);

        this.ws.onopen = () => {
          console.log('WebSocket connected');
          this.wsConnected = true;
          this.subscribeToOHLCV();
        };

        this.ws.onmessage = (event) => {
          try {
            const message = JSON.parse(event.data);
            this.handleWebSocketMessage(message);
          } catch (error) {
            console.error('Error parsing WebSocket message:', error);
          }
        };

        this.ws.onclose = () => {
          console.log('WebSocket disconnected');
          this.wsConnected = false;
          // Attempt to reconnect after 3 seconds
          setTimeout(() => {
            if (!this.wsConnected) {
              this.connectWebSocket();
            }
          }, 3000);
        };

        this.ws.onerror = (error) => {
          console.error('WebSocket error:', error);
          this.wsConnected = false;
        };
      } catch (error) {
        console.error('Failed to connect WebSocket:', error);
      }
    },

    subscribeToOHLCV() {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        const subscribeMessage = {
          action: 'subscribe',
          channel: 'ohlcv',
          params: {
            symbol: this.selectedMarket,
            interval: this.selectedInterval
          }
        };
        this.ws.send(JSON.stringify(subscribeMessage));
      }
    },

    unsubscribeFromOHLCV() {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        const unsubscribeMessage = {
          action: 'unsubscribe',
          channel: 'ohlcv',
          params: {
            symbol: this.selectedMarket,
            interval: this.selectedInterval
          }
        };
        this.ws.send(JSON.stringify(unsubscribeMessage));
      }
    },

    handleWebSocketMessage(message) {
      if (message.channel === 'ohlcv' && message.data && message.data.s === 'ok') {
        const data = message.data;
        if (data.t && data.t.length > 0) {
          const newCandle = {
            time: data.t[0],
            open: data.o[0],
            high: data.h[0],
            low: data.l[0],
            close: data.c[0]
          };

          const newVolume = {
            time: data.t[0],
            value: data.v[0],
            color: data.c[0] >= data.o[0] ? 'rgba(0, 255, 136, 0.3)' : 'rgba(255, 68, 68, 0.3)'
          };

          if (this.candlestickSeries && this.volumeSeries) {
            this.candlestickSeries.update(newCandle);
            this.volumeSeries.update(newVolume);
          }

          // Emit the latest price to parent component
          this.$emit('price-update', data.c[0]);
        }
      }
    },

    onMarketChange() {
      this.unsubscribeFromOHLCV();
      this.loadHistoricalData();
      this.subscribeToOHLCV();
    },

    onIntervalChange() {
      this.unsubscribeFromOHLCV();
      this.loadHistoricalData();
      this.subscribeToOHLCV();
    },

    handleResize() {
      if (this.chart && this.$refs.chartContainer) {
        this.chart.applyOptions({
          width: this.$refs.chartContainer.clientWidth,
        });
      }
    },

    cleanup() {
      if (this.ws) {
        this.unsubscribeFromOHLCV();
        this.ws.close();
      }
      if (this.chart) {
        this.chart.remove();
      }
      window.removeEventListener('resize', this.handleResize);
    }
  }
};
</script>

<style scoped>
.kline-chart {
  width: 100%;
  height: 100%;
}

.chart-controls {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 10px;
  padding: 10px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 5px;
  border: 1px solid rgba(255, 153, 255, 0.3);
}

.control-group {
  display: flex;
  align-items: center;
  gap: 8px;
}

.control-group label {
  color: #ffffff;
  font-size: 12px;
  font-weight: 500;
}

.control-group select {
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid #ff99ff;
  border-radius: 3px;
  color: #ffffff;
  padding: 4px 8px;
  font-size: 12px;
}

.control-group select:focus {
  outline: none;
  border-color: #9900cc;
  box-shadow: 0 0 3px rgba(255, 153, 255, 0.5);
}

.status {
  margin-left: auto;
}

.connection-status {
  font-size: 12px;
  padding: 2px 8px;
  border-radius: 3px;
  font-weight: 500;
}

.connection-status.connected {
  color: #00ff88;
  background: rgba(0, 255, 136, 0.1);
}

.connection-status.disconnected {
  color: #ff4444;
  background: rgba(255, 68, 68, 0.1);
}

.chart-wrapper {
  width: 100%;
  height: 400px;
  border: 1px solid rgba(255, 153, 255, 0.3);
  border-radius: 5px;
  overflow: hidden;
}
</style>