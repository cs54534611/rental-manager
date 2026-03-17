// miniprogram/pages/settings/owner.js
const app = getApp();

Page({
  data: {
    name: '',
    phone: ''
  },

  onLoad() {
    this.loadOwner();
  },

  async loadOwner() {
    try {
      const res = await app.request({ url: '/settings/owner/info' });
      this.setData({ name: res.data.name || '', phone: res.data.phone || '' });
    } catch (err) { console.error(err); }
  },

  async onSave() {
    try {
      await app.request({ url: '/settings/owner/info', method: 'PUT', data: this.data });
      wx.showToast({ title: '保存成功' });
      setTimeout(() => wx.navigateBack(), 1500);
    } catch (err) {
      wx.showToast({ title: '保存失败', icon: 'none' });
    }
  }
});
