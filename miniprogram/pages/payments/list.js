// miniprogram/pages/payments/list.js
const app = getApp();

Page({
  data: {
    list: [],
    page: 1,
    limit: 20,
    hasMore: true,
    statusList: [
      { value: '', name: '全部状态' },
      { value: 'pending', name: '待支付' },
      { value: 'success', name: '已支付' },
      { value: 'failed', name: '支付失败' },
      { value: 'refunded', name: '已退款' }
    ],
    statusIndex: 0,
    statusText: '全部状态',
    selectedStatus: ''
  },

  onLoad() {
    this.loadList();
  },

  async loadList() {
    try {
      const res = await app.request({
        url: '/payments/list',
        data: { page: this.data.page, limit: this.data.limit }
      });
      
      if (res.code === 0) {
        this.setData({
          list: res.data.list,
          hasMore: res.data.list.length < res.data.total
        });
      }
    } catch (err) {
      console.error('加载失败:', err);
    }
  },

  onStatusChange(e) {
    const index = e.detail.value;
    const status = this.data.statusList[index].value;
    const name = this.data.statusList[index].name;
    this.setData({ 
      selectedStatus: status,
      statusIndex: index,
      statusText: name
    });
    this.loadList();
  },

  handleRefund(e) {
    const paymentId = e.currentTarget.dataset.id;
    wx.showModal({
      title: '确认退款',
      content: '确定要退款吗？',
      success: async (res) => {
        if (res.confirm) {
          try {
            await app.request({
              url: '/payments/refund',
              method: 'POST',
              data: { payment_id: paymentId, reason: '管理员退款' }
            });
            wx.showToast({ title: '退款成功' });
            this.loadList();
          } catch (err) {
            wx.showToast({ title: '退款失败', icon: 'none' });
          }
        }
      }
    });
  }
});
