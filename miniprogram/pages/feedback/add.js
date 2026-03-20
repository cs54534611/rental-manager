// miniprogram/pages/feedback/add.js - 提交反馈
const app = getApp();

Page({
  data: {
    type: 'suggestion',
    content: '',
    types: [
      { value: 'suggestion', label: '建议' },
      { value: 'complaint', label: '投诉' },
      { value: 'praise', label: '表扬' }
    ]
  },

  onTypeChange(e) {
    this.setData({ type: this.data.types[e.detail.value].value });
  },

  onContentInput(e) {
    this.setData({ content: e.detail.value });
  },

  async onSubmit() {
    if (!this.data.content.trim()) {
      return wx.showToast({ title: '请输入内容', icon: 'none' });
    }
    wx.showLoading({ title: '提交中...' });
    try {
      const userInfo = app.globalData.userInfo || {};
      await app.request({
        url: '/feedback/submit',
        method: 'POST',
        data: {
          tenant_id: userInfo.tenant_id || 14,
          type: this.data.type,
          content: this.data.content
        }
      });
      wx.hideLoading();
      wx.showToast({ title: '提交成功' });
      setTimeout(() => wx.navigateBack(), 1500);
    } catch (err) {
      wx.hideLoading();
      wx.showToast({ title: '提交失败', icon: 'none' });
    }
  }
});
