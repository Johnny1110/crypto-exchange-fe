<template>
  <div class="app">
    <!-- 其他組件 -->
    <CryptoMarket
        v-if="activeTab === 'home'"
        @navigate="handleNavigation"
        @logout="handleLogout"
    />

    <router-view />

    <!-- TODO Markets 組件 -->
  </div>
</template>

<script>
import CryptoMarket from '@/components/CryptoMarket.vue'
import { authUtils } from '@/services/auth'

export default {
  // eslint-disable-next-line vue/multi-word-component-names
  name: 'Home',
  components: {
    CryptoMarket,
  },

  data() {
    return {
      activeTab: 'home',
      isLoggedIn: false
    }
  },
  mounted() {
    this.checkAuthStatus()
  },
  methods: {
    handleNavigation(tab) {
      this.activeTab = tab
    },

    handleLogout() {
      authUtils.clearAuthData()
      this.isLoggedIn = false
      this.activeTab = 'home'
    },

    showLogin() {
      // 顯示登入彈窗的邏輯
      this.activeTab = 'home'
    },

    checkAuthStatus() {
      this.isLoggedIn = authUtils.isAuthenticated()
    }
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