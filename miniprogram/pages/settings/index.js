// miniprogram/pages/settings/index.js
const app = getApp();

Page({
  data: {
    owner: {},
    userInfo: {},
    isAdmin: false
  },

  onLoad() {
    this.checkRole();
    this.loadOwner();
  },

  onShow() {
    this.setData({ 
      userInfo: app.globalData.userInfo || {},
      role: app.globalData.role || wx.getStorageSync('role')
    });
    this.checkRole();
    this.loadOwner();
  },

  checkRole() {
    const role = app.getRole();
    this.setData({ 
      isAdmin: role === 'super' || role === 'admin'
    });
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

  // 管理员管理
  goToAdminUsers() {
    wx.navigateTo({ url: '/pages/admin/users' });
  },

  // 角色权限查看
  goToRoleCheck() {
    wx.navigateTo({ url: '/pages/role/check' });
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
