<template>
  <div class="logo" />
  <a-menu
    theme="dark"
    mode="horizontal"
    v-model:selectedKeys="selectedKeys"
    :style="{ lineHeight: '64px' }"
  >
    <a-menu-item key="1">
      <router-link to="/">首頁</router-link>
    </a-menu-item>

    <a-sub-menu>
      <template #icon>
        <UserOutlined />
      </template>
      <template #title>用戶管理</template>
      <a-menu-item key="2-1">
        <router-link to="/DeviceUserList">裝置使用者</router-link>
      </a-menu-item>
      <a-menu-item key="2-2"
        ><router-link to="/SystemUserList">系統使用者</router-link>
      </a-menu-item>
    </a-sub-menu>

    <a-sub-menu>
      <template #icon>
        <VideoCameraOutlined />
      </template>
      <template #title>
        <router-link to="/DeviceList">裝置管理</router-link>
      </template>
    </a-sub-menu>

    <a-sub-menu>
      <template #icon>
        <FileSearchOutlined />
      </template>
      <template #title>操作紀錄</template>
      <a-menu-item key="3-1">
        <router-link to="/IoTLogList">物聯網操作紀錄</router-link>
      </a-menu-item>
      <a-menu-item key="3-2">
        <router-link to="/AppLogLost">應用程式操作紀錄</router-link>
      </a-menu-item>
      <a-menu-item key="3-3">
        <router-link to="/WebLogList">網站操作紀錄</router-link>
      </a-menu-item>
      <a-menu-item key="3-4">
        <router-link to="/AccountLogList">帳號異動紀錄</router-link>
      </a-menu-item>
    </a-sub-menu>

    <a-menu-item key="4">
      <a @click.prevent="logOut()">登出</a>
    </a-menu-item>
  </a-menu>
</template>

<script lang="ts">
import {
  UserOutlined,
  FileSearchOutlined,
  VideoCameraOutlined,
} from "@ant-design/icons-vue";
import { defineComponent, ref } from "vue";
import { useStore } from "vuex";
import { useRouter } from "vue-router";

export default defineComponent({
  components: {
    UserOutlined,
    FileSearchOutlined,
    VideoCameraOutlined,
  },
  setup() {
    const store = useStore();
    const router = useRouter();

    const logOut = () => {
      store.commit("clearToken");
      router.push({ path: "/login" });
    };

    return {
      selectedKeys: ref<string[]>(["1"]),
      logOut,
    };
  },
});
</script>

<style>
.site-layout-content {
  min-height: 280px;
  padding: 24px;
  background: #fff;
}
#components-layout-demo-top .logo {
  float: left;
  width: 120px;
  height: 31px;
  margin: 16px 24px 16px 0;
  background: rgba(255, 255, 255, 0.3);
}
.ant-row-rtl #components-layout-demo-top .logo {
  float: right;
  margin: 16px 0 16px 24px;
}

[data-theme="dark"] .site-layout-content {
  background: #141414;
}
</style>
