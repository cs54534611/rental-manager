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
    this.loadPendingStats();
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
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({ url: '/pages/rentals/pay?id=' + id });
  },

  onDelete(e) {
    const id = e.currentTarget.dataset.id;
    wx.showModal({
      title: '确认删除',
      content: '确定要删除该租金记录吗？',
      success: async (res) => {
        if (res.confirm) {
          try {
            await app.request({ url: '/rentals/' + id, method: 'DELETE' });
            wx.showToast({ title: '删除成功' });
            this.loadRentals();
          } catch (err) {
            wx.showToast({ title: '删除失败', icon: 'none' });
          }
        }
      }
    });
  },

  goToAdd() {
    wx.navigateTo({ url: '/pages/rentals/add' });
  }
});
