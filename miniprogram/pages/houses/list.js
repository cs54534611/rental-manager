// miniprogram/pages/houses/list.js
const app = getApp();

Page({
  data: {
    houses: [],
    status: '',
    keyword: '',
    isTenant: false,
    statusMap: { 0: '空置', 1: '已出租', 2: '待出租' }
  },

  onLoad() {
    this.setData({ isTenant: app.globalData.role === 'tenant' });
    this.loadHouses();
  },

  onShow() {
    this.setData({ isTenant: app.globalData.role === 'tenant' });
    this.loadHouses();
  },

  async loadHouses() {
    try {
      const res = await app.request({
        url: '/houses',
        data: { status: this.data.status, keyword: this.data.keyword }
      });
      this.setData({ houses: res.data.list });
    } catch (err) {
      console.error(err);
    }
  },

  onFilter(e) {
    this.setData({ status: e.currentTarget.dataset.status });
    this.loadHouses();
  },

  onSearch(e) {
    this.setData({ keyword: e.detail.value });
    this.loadHouses();
  },

  goToDetail(e) {
    wx.navigateTo({ url: '/pages/houses/detail?id=' + e.currentTarget.dataset.id });
  },

  goToAdd() {
    wx.navigateTo({ url: '/pages/houses/add' });
  }
});
