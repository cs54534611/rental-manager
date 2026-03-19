// miniprogram/pages/finance/index.js
const app = getApp();

Page({
  data: {
    isTenant: false,
    stats: {
      totalIncome: 0,
      monthIncome: 0,
      pendingAmount: 0,
      channelStats: [],
      trend: []
    },
    maxTrend: 100
  },

  onLoad() {
    this.setData({ isTenant: app.globalData.role === 'tenant' });
    if (app.globalData.role === 'tenant') {
      wx.showToast({ title: '无权限访问', icon: 'none' });
      setTimeout(() => wx.switchTab({ url: '/pages/index/index' }), 1500);
      return;
    }
    this.loadStats();
  },

  onShow() {
    this.setData({ isTenant: app.globalData.role === 'tenant' });
    if (app.globalData.role === 'tenant') {
      wx.showToast({ title: '无权限访问', icon: 'none' });
      setTimeout(() => wx.switchTab({ url: '/pages/index/index' }), 1500);
      return;
    }
    this.loadStats();
  },

  async loadStats() {
    try {
      const res = await app.request({
        url: '/payments/stats',
        method: 'GET'
      });
      
      if (res.code === 0) {
        const stats = res.data;
        this.setData({
          stats: stats,
          maxTrend: stats.trend?.length > 0 ? Math.max(...stats.trend.map(t => t.amount)) : 100
        });
      }
    } catch (err) {
      console.error('加载失败:', err);
    }
  },

  goToPayments() {
    wx.navigateTo({ url: '/pages/payments/list' });
  },

  goToMeter() {
    wx.navigateTo({ url: '/pages/meter/list' });
  },

  goToCheckout() {
    wx.navigateTo({ url: '/pages/checkout/list' });
  },

  goToStats() {
    wx.navigateTo({ url: '/pages/stats/index' });
  }
});
