import { ref } from 'vue';

// 简单的事件总线
const eventBus = {
  events: {},
  
  on(event, callback) {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event].push(callback);
  },
  
  off(event, callback) {
    if (!this.events[event]) return;
    this.events[event] = this.events[event].filter(cb => cb !== callback);
  },
  
  emit(event, data) {
    if (!this.events[event]) return;
    this.events[event].forEach(callback => callback(data));
  }
};

// 设置对话框状态
export const showSettingsDialog = ref(false);

export const openSettings = () => {
  showSettingsDialog.value = true;
  eventBus.emit('openSettings');
};

export const closeSettings = () => {
  showSettingsDialog.value = false;
  eventBus.emit('closeSettings');
};

export default eventBus;
