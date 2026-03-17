// miniprogram/pages/settings/index.js
const app = getApp();

Page({
  data: {
    owner: {}
  },

  onLoad() {
    this.loadOwner();
  },

  onShow() {
    this.loadOwner();
  },

  async loadOwner() {
    try {
      const res = await app.request({ url: '/settings/owner/info' });
      this.setData({ owner: res.data });
    } catch (err) { console.error(err); }
  },

  goToEdit() {
    wx.navigateTo({ url: '/pages/settings/owner' });
  },

  goToRemind() {
    wx.navigateTo({ url: '/pages/settings/remind' });
  },

  goToStaff() {
    wx.navigateTo({ url: '/pages/staff/list' });
  },

  goToExport() {
    wx.navigateTo({ url: '/pages/stats/index' });
  }
});
