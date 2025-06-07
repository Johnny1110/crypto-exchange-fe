<template>
  <div class="cmd-window">
    <div v-for="(line, index) in commandHistory" :key="index" v-html="line"></div>
    <div class="current-line">
      C:\CryptoEx> {{ currentCommand }}<span class="cursor">_</span>
    </div>
  </div>
</template>

<script>
export default {
  name: 'CommandWindow',
  props: {
    selectedMarket: {
      type: Object,
      default: null
    }
  },
  data() {
    return {
      commandHistory: [
        'C:\\CryptoEx> dir',
        'Loading market data...',
        'Connection established to CryptoEx server.'
      ],
      currentCommand: '',
      cursorVisible: true
    }
  },
  mounted() {
    this.startCursorBlink()
    this.startAutoCommands()
  },
  watch: {
    selectedMarket(newMarket) {
      if (newMarket) {
        this.addCommand(`market ${newMarket.market_name}`)
        this.addCommand(`Price: ${newMarket.latest_price} USDT`)
        this.addCommand(`24h Change: ${(newMarket.price_change_24h * 100).toFixed(2)}%`)
      }
    }
  },
  methods: {
    addCommand(command) {
      this.commandHistory.push(`C:\\CryptoEx> ${command}`)
      if (this.commandHistory.length > 10) {
        this.commandHistory.shift()
      }
    },

    startCursorBlink() {
      setInterval(() => {
        this.cursorVisible = !this.cursorVisible
      }, 500)
    },

    startAutoCommands() {
      const commands = [
        'status',
        'refresh',
        'monitor'
      ]

      let commandIndex = 0
      setInterval(() => {
        this.currentCommand = commands[commandIndex]
        setTimeout(() => {
          this.addCommand(commands[commandIndex])
          this.currentCommand = ''
          commandIndex = (commandIndex + 1) % commands.length
        }, 2000)
      }, 5000)
    }
  }
}
</script>

<style scoped>
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

.current-line {
  color: #ff66cc;
}

.cursor {
  animation: blink 1s infinite;
}

@keyframes blink {
  0%, 50% { opacity: 1; }
  51%, 100% { opacity: 0; }
}
</style>