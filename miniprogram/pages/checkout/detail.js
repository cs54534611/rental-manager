// pages/checkout/detail.js
const app = getApp();

Page({
  data: {
    id: null,
    detail: {},
    statusText: ''
  },

  onLoad(options) {
    if (options.id) {
      this.setData({ id: options.id });
      this.loadDetail(options.id);
    }
  },

  async loadDetail(id) {
    try {
      const res = await app.request({
        url: `/checkout/${id}`,
        method: 'GET'
      });
      
      if (res.code === 0) {
        const statusMap = { 0: '申请中', 1: '已预约', 2: '已完成', 3: '已取消' };
        this.setData({
          detail: res.data,
          statusText: statusMap[res.data.status] || '未知'
        });
      }
    } catch (err) {
      wx.showToast({ title: '加载失败', icon: 'none' });
    }
  },

  handlePass() {
    wx.showModal({
      title: '确认通过',
      content: '确定要通过该退房申请吗？',
      success: (res) => {
        if (res.confirm) {
          this.updateStatus(1);
        }
      }
    });
  },

  handleReject() {
    wx.showModal({
      title: '确认拒绝',
      content: '确定要拒绝该退房申请吗？',
      success: (res) => {
        if (res.confirm) {
          this.updateStatus(3);
        }
      }
    });
  },

  async updateStatus(status) {
    try {
      const res = await app.request({
        url: `/checkout/${this.data.id}`,
        method: 'PUT',
        data: { status }
      });
      
      if (res.code === 0) {
        wx.showToast({ title: '操作成功' });
        this.loadDetail(this.data.id);
      }
    } catch (err) {
      wx.showToast({ title: '操作失败', icon: 'none' });
    }
  }
});
