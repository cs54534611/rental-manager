// miniprogram/pages/tenants/list.js
const app = getApp();

Page({
  data: {
    tenants: [],
    keyword: ''
  },

  onLoad() {
    this.loadTenants();
  },

  onShow() {
    this.loadTenants();
  },

  async loadTenants() {
    try {
      const res = await app.request({ url: '/tenants', data: { keyword: this.data.keyword } });
      this.setData({ tenants: res.data.list });
    } catch (err) { console.error(err); }
  },

  onSearch(e) {
    this.setData({ keyword: e.detail.value });
    this.loadTenants();
  },

  goToDetail(e) {
    wx.navigateTo({ url: '/pages/tenants/detail?id=' + e.currentTarget.dataset.id });
  },

  goToAdd() {
    wx.navigateTo({ url: '/pages/tenants/add' });
  }
});
