// miniprogram/pages/settings/index.js
const app = getApp();

Page({
  data: {
    owner: {},
    userInfo: {}
  },

  onLoad() {
    this.loadOwner();
  },

  onShow() {
    this.setData({ userInfo: app.globalData.userInfo || {} });
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
  },

  goToBackup() {
    wx.navigateTo({ url: '/pages/backup/index' });
  },

  // 退出登录
  onLogout() {
    wx.showModal({
      title: '确认退出',
      content: '确定要退出登录吗？',
      success: (res) => {
        if (res.confirm) {
          app.logout();
        }
      }
    });
  }
});
