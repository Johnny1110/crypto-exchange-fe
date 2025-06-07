<template>
  <div id="home">
    <CryptoMarket />
  </div>
</template>

<script>
import CryptoMarket from '@/components/CryptoMarket.vue'

export default {
  // eslint-disable-next-line vue/multi-word-component-names
  name: 'Home',
  components: {
    CryptoMarket
  }
}
</script>

<style>
#home {
  margin: 0;
  padding: 0;
}

/* 重置全局樣式 */
* {
  box-sizing: border-box;
}

body {
  margin: 0;
  padding: 0;
  overflow-x: auto;
}
</style>