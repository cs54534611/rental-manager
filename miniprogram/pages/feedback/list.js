// miniprogram/pages/feedback/list.js - 投诉建议列表
const app = getApp();

Page({
  data: {
    list: [],
    loading: true,
    isAdmin: false,
    isTenant: false,
    currentTab: 'all',
    statusMap: {
      submitted: { text: '待处理', color: '#ff9800' },
      replied: { text: '已回复', color: '#4caf50' },
      closed: { text: '已关闭', color: '#999' }
    }
  },

  onLoad() {
    const role = app.globalData.role || wx.getStorageSync('role');
    this.setData({ 
      isAdmin: role === 'super' || role === 'admin',
      isTenant: role === 'tenant'
    });
    this.loadList();
  },

  onShow() {
    this.loadList();
  },

  async loadList() {
    this.setData({ loading: true });
    try {
      const res = await app.request({ url: '/feedback' });
      this.setData({ list: res.data || [] });
    } catch (err) {
      console.error(err);
    } finally {
      this.setData({ loading: false });
    }
  },

  async onReply(e) {
    const { id } = e.currentTarget.dataset;
    wx.showModal({
      title: '回复',
      editable: true,
      placeholderText: '请输入回复内容',
      success: async (res) => {
        if (res.confirm && res.content) {
          wx.showLoading();
          try {
            await app.request({
              url: `/feedback/${id}/reply`,
              method: 'PUT',
              data: { reply: res.content }
            });
            wx.showToast({ title: '回复成功' });
            this.loadList();
          } catch (err) {
            wx.showToast({ title: '回复失败', icon: 'none' });
          }
        }
      }
    });
  },

  goToAdd() {
    wx.navigateTo({ url: '/pages/feedback/add' });
  },

  getStatusInfo(status) {
    return this.data.statusMap[status] || { text: status, color: '#999' };
  }
});
