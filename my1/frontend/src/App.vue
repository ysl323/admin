<template>
  <div id="app">
    <router-view />
  </div>
</template>

<script>
export default {
  name: 'App'
};
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

/* 移除所有输入框的默认outline和box-shadow */
input:focus,
textarea:focus,
select:focus {
  outline: none !important;
  box-shadow: none !important;
  -webkit-box-shadow: none !important;
  -moz-box-shadow: none !important;
}

/* 特别针对学习页面输入框 */
.solid-underline-input,
.solid-underline-input:focus,
.solid-underline-input:active,
.solid-underline-input:hover {
  outline: none !important;
  box-shadow: none !important;
  -webkit-box-shadow: none !important;
  -moz-box-shadow: none !important;
  border-top: none !important;
  border-left: none !important;
  border-right: none !important;
}

#app {
  font-family: 'Helvetica Neue', Helvetica, 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  min-height: 100vh;
  background-color: #f5f5f5;
}

/* 引入移动端优化样式 */
@import './styles/mobile.css';
</style>
