// miniprogram/pages/contracts/list.js
const app = getApp();

Page({
  data: {
    contracts: [],
    status: '',
    isTenant: false,
    paymentMethodMap: { 1: '押一付三', 2: '押一付一', 3: '半年付', 4: '年付' }
  },

  onLoad(options) {
    if (options.status) {
      this.setData({ status: options.status });
    }
    const role = app.globalData.role || wx.getStorageSync('role');
    this.setData({ isTenant: role === 'tenant' });
    this.loadContracts();
  },

  onShow() {
    this.loadContracts();
  },

  async loadContracts() {
    try {
      const res = await app.request({ url: '/contracts', data: { status: this.data.status } });
      this.setData({ contracts: res.data.list });
    } catch (err) { console.error(err); }
  },

  onFilter(e) {
    const status = e.currentTarget.dataset.status;
    this.setData({ status: status === '' ? '' : parseInt(status) });
    this.loadContracts();
  },

  goToDetail(e) {
    wx.navigateTo({ url: '/pages/contracts/detail?id=' + e.currentTarget.dataset.id });
  },

  goToAdd() {
    wx.navigateTo({ url: '/pages/contracts/add' });
  }
});
