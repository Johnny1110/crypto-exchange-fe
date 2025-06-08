<template>
  <div class="app">
    <div class="container">
      <div class="title-bar">
        <span>CryptoEx 2000 - Cryptocurrency Exchange</span>
        <div>
          <button>_</button>
          <button>□</button>
          <button>X</button>
        </div>
      </div>

      <!-- Login Modal -->
      <LoginModal
          :visible="showLoginModal"
          @close="showLoginModal = false"
          @login-success="onLoginSuccess"
      />

      <div class="nav-bar">
        <a>
          <router-link to="/" @click.prevent="activeTab = 'Home'" :class="{ active: activeTab === 'Home' }">Home
          </router-link>
        </a>
        <a href="#" @click.prevent="activeTab = 'trade'" :class="{ active: activeTab === 'trade' }">Trade</a>
        <a>
          <router-link to="/balances" @click.prevent="activeTab = 'balances'"
                       :class="{ active: activeTab === 'balances' }">Wallet
          </router-link>
        </a>
        <a href="#" @click.prevent="activeTab = 'account'" :class="{ active: activeTab === 'account' }">Account</a>
        <a href="#" @click.prevent="isLoggedIn ? handleLogout() : showLogin()" class="auth-link">
          {{ isLoggedIn ? 'Logout' : 'Login' }}
        </a>
      </div>

      <!-- User Profile Section -->
      <UserProfile
          v-if="isLoggedIn"
          @logout="handleLogout"
      />

      <div class="loading" v-if="loading">
        <div class="loading-text">Loading market data...</div>
      </div>

      <div class="error" v-if="error">
        <div class="error-text">{{ error }}</div>
        <button @click="fetchMarketData" class="retry-btn">Retry</button>
      </div>


      <div class="content">
        <router-view/>
      </div>
      <footer class="footer">
        CryptoEx 2000 © 2025 - All Rights Reserved |
        Last Updated: {{ lastUpdated }}
      </footer>
    </div>

  </div>
</template>

<script setup lang="js">
import {authUtils} from '@/services/auth'
import LoginModal from "@/components/LoginModal.vue";
import UserProfile from "@/components/UserProfile.vue";
import {userAPI} from "@/services/apiService";
import {onMounted, reactive, ref} from "vue";


 let userProfile = reactive({data:{
     "id": "",
     "username": "",
     "vip_level": null,
     "maker_fee": null,
     "taker_fee": null,
     "created_at": null
   }});
let activeTab = ref('home')
let isLoggedIn = ref(false)
let showLoginModal = ref(false)


onMounted(() => {
  checkAuthStatus()
})
const onLoginSuccess = async () => {
  isLoggedIn.value = true
  // 獲取用戶詳細資料
  try {
    const response = await userAPI.getProfile();
    if (response.data.code === '0000000') {
      console.log('User profile fetched successfully:', response.data.data)
      userProfile.data = response.data.data;
      authUtils.setUserProfile(response.data.data)
    }
  } catch (error) {
    console.error('Failed to fetch user profile:', error)
  }
}

const handleLogout = async () => {
  await authUtils.clearAuthData()
  isLoggedIn.value = false
  activeTab.value = 'home'
}

const showLogin = () => {
  // 顯示登入彈窗的邏輯
  showLoginModal.value = true
}

const checkAuthStatus = async () => {
  isLoggedIn.value = await authUtils.isAuthenticated()
  if (isLoggedIn.value) {
    try {
      userProfile.data = authUtils.getUserProfile();
    } catch (error) {
      console.error('Failed to fetch user profile:', error)
    }
  }
}


</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap');

.container {
  font-family: 'Press Start 2P', cursive;
  background: rgba(51, 0, 51, 0.8);
  border: 3px solid #ff99ff;
  width: auto;
  height: 140vh;
  margin: -10px;
  padding: 0;
  box-shadow: 0 0 109px #ff66cc, 0 0 20px #9900cc;
  border-radius: 10px;

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
  margin-bottom: 15px;
  box-shadow: 0 0 8px #ff66cc;
}

.nav-bar a {
  margin-right: 12px;
  color: #ffccff;
  text-decoration: none;
  font-size: 10px;
  text-shadow: 1px 1px #330033;
  cursor: pointer;
}

.nav-bar a:hover,
.nav-bar a.active {
  color: #ff66cc;
  text-shadow: 0 0 5px #ff66cc;
}

.nav-bar a.auth-link {
  color: #ff66cc;
  font-weight: bold;
}

.loading {
  text-align: center;
  padding: 50px;
}

.loading-text {
  font-size: 12px;
  color: #ff66cc;
  animation: pulse 1.5s infinite;
}

.error {
  text-align: center;
  padding: 20px;
}

.error-text {
  color: #ff3366;
  font-size: 10px;
  margin-bottom: 10px;
}

.retry-btn {
  background: #ff66cc;
  border: 2px solid #ff99ff;
  padding: 5px 15px;
  cursor: pointer;
  font-family: 'Press Start 2P', cursive;
  font-size: 8px;
  color: #ffffff;
}

.retry-btn:hover {
  background: #cc00ff;
}

.footer {
  text-align: center;
  padding: 10px;
  font-size: 14px;
  position: sticky; /* 或 fixed，按需更改 */
  bottom: 0;
  width: 100%;
}

.content {
  height: 110vh;

}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}
</style>