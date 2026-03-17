// miniprogram/pages/backup/index.js
const app = getApp();

Page({
  data: {
    list: []
  },

  onShow() {
    this.loadList();
  },

  async loadList() {
    try {
      const res = await app.request({ url: '/backup' });
      this.setData({ list: res.data || [] });
    } catch (err) {
      console.error(err);
    }
  },

  // 手动备份
  onBackup() {
    wx.showLoading({ title: '备份中...' });
    app.request({ url: '/backup', method: 'POST' })
      .then(res => {
        wx.hideLoading();
        wx.showToast({ title: '备份成功' });
        this.loadList();
      })
      .catch(err => {
        wx.hideLoading();
        wx.showToast({ title: '备份失败', icon: 'none' });
      });
  },

  // 还原备份
  onRestore(e) {
    const filename = e.currentTarget.dataset.filename;
    wx.showModal({
      title: '确认还原',
      content: '还原将覆盖当前数据，确定要继续吗？',
      success: (res) => {
        if (res.confirm) {
          wx.showLoading({ title: '还原中...' });
          app.request({ url: '/backup/restore/' + filename, method: 'POST' })
            .then(res => {
              wx.hideLoading();
              wx.showToast({ title: '还原成功' });
            })
            .catch(err => {
              wx.hideLoading();
              wx.showToast({ title: '还原失败', icon: 'none' });
            });
        }
      }
    });
  },

  // 删除备份
  onDelete(e) {
    const filename = e.currentTarget.dataset.filename;
    wx.showModal({
      title: '确认删除',
      content: '确定要删除该备份吗？',
      success: (res) => {
        if (res.confirm) {
          app.request({ url: '/backup/' + filename, method: 'DELETE' })
            .then(res => {
              wx.showToast({ title: '删除成功' });
              this.loadList();
            })
            .catch(err => {
              wx.showToast({ title: '删除失败', icon: 'none' });
            });
        }
      }
    });
  }
});
