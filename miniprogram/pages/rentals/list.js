// miniprogram/pages/rentals/list.js
const app = getApp();

Page({
  data: {
    rentals: [],
    status: '',
    pendingAmount: 0,
    pendingCount: 0,
    statusMap: { 0: '未付', 1: '已付', 2: '逾期', 3: '减免' }
  },

  onLoad() {
    this.loadRentals();
    this.loadPendingStats();
  },

  onShow() {
    this.loadRentals();
  },

  async loadRentals() {
    try {
      const res = await app.request({ url: '/rentals', data: { status: this.data.status } });
      this.setData({ rentals: res.data.list });
    } catch (err) { console.error(err); }
  },

  async loadPendingStats() {
    try {
      const res = await app.request({ url: '/rentals/stats/pending' });
      this.setData({ pendingAmount: res.data.total, pendingCount: res.data.count });
    } catch (err) { console.error(err); }
  },

  onFilter(e) {
    this.setData({ status: e.currentTarget.dataset.status });
    this.loadRentals();
  },

  onPay(e) {
    wx.navigateTo({ url: '/pages/rentals/add?id=' + e.currentTarget.dataset.id });
  },

  goToAdd() {
    wx.navigateTo({ url: '/pages/rentals/add' });
  }
});
