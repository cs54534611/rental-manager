// miniprogram/pages/reminders/list.js
const app = getApp();

Page({
  data: {
    reminders: [],
    stats: { pending: 0, sent: 0, notified: 0 },
    page: 1,
    pageSize: 20,
    total: 0,
    loading: false,
    tabs: [
      { key: '', label: '全部' },
      { key: '0', label: '待发送' },
      { key: '1', label: '已发送' },
      { key: '3', label: '已通知' }
    ],
    currentTab: ''
  },

  onLoad() {
    this.loadReminders();
    this.loadStats();
  },

  onShow() {
    this.loadReminders();
    this.loadStats();
  },

  async loadReminders() {
    this.setData({ loading: true });
    try {
      const res = await app.request({
        url: '/reminders',
        data: { 
          status: this.data.currentTab,
          page: this.data.page,
          pageSize: this.data.pageSize
        }
      });
      this.setData({ 
        reminders: res.data.list,
        total: res.data.total
      });
    } catch (err) {
      console.error(err);
    } finally {
      this.setData({ loading: false });
    }
  },

  async loadStats() {
    try {
      const res = await app.request({ url: '/reminders/stats' });
      this.setData({ stats: res.data });
    } catch (err) {
      console.error(err);
    }
  },

  onTabChange(e) {
    const index = e.currentTarget.dataset.index;
    this.setData({ currentTab: this.data.tabs[index].key, page: 1 });
    this.loadReminders();
  },

  async onSendAll() {
    wx.showModal({
      title: '确认发送',
      content: '确定发送所有到期待收租金的提醒吗？',
      success: async (res) => {
        if (res.confirm) {
          wx.showLoading({ title: '发送中...' });
          try {
            const r = await app.request({ 
              url: '/reminders/send-all', 
              method: 'POST' 
            });
            wx.showToast({ title: r.message || '发送成功' });
            this.loadReminders();
            this.loadStats();
          } catch (err) {
            wx.showToast({ title: '发送失败', icon: 'none' });
          } finally {
            wx.hideLoading();
          }
        }
      }
    });
  },

  goToDetail(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({ url: `/pages/reminders/detail?id=${id}` });
  }
});
