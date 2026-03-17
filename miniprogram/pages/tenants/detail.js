// miniprogram/pages/tenants/detail.js
const app = getApp();

Page({
  data: {
    tenant: {}
  },

  onLoad(options) {
    if (options.id) {
      this.loadTenant(options.id);
    }
  },

  async loadTenant(id) {
    try {
      const res = await app.request({ url: '/tenants/' + id });
      this.setData({ tenant: res.data });
    } catch (err) { console.error(err); }
  },

  onEdit() {
    wx.navigateTo({ url: '/pages/tenants/add?id=' + this.data.tenant.id });
  },

  onDelete() {
    wx.showModal({
      title: '确认删除',
      content: '确定要删除该租客吗？',
      success: async (res) => {
        if (res.confirm) {
          try {
            await app.request({ url: '/tenants/' + this.data.tenant.id, method: 'DELETE' });
            wx.showToast({ title: '删除成功' });
            setTimeout(() => wx.navigateBack(), 1500);
          } catch (err) {
            wx.showToast({ title: '删除失败', icon: 'none' });
          }
        }
      }
    });
  }
});
