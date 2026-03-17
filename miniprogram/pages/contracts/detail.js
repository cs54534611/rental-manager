// miniprogram/pages/contracts/detail.js
const app = getApp();

Page({
  data: {
    contract: {},
    typeMap: { 1: '新签', 2: '续签', 3: '转租' },
    paymentMethodMap: { 1: '押一付三', 2: '押一付一', 3: '半年付', 4: '年付' }
  },

  onLoad(options) {
    if (options.id) {
      this.loadContract(options.id);
    }
  },

  async loadContract(id) {
    try {
      const res = await app.request({ url: '/contracts/' + id });
      this.setData({ contract: res.data });
    } catch (err) { console.error(err); }
  },

  onTerminate() {
    wx.showModal({
      title: '确认终止',
      content: '确定要终止该合同吗？终止后房源将变为空置状态',
      success: async (res) => {
        if (res.confirm) {
          try {
            await app.request({ url: '/contracts/' + this.data.contract.id, method: 'DELETE' });
            wx.showToast({ title: '终止成功' });
            setTimeout(() => wx.navigateBack(), 1500);
          } catch (err) {
            wx.showToast({ title: '终止失败', icon: 'none' });
          }
        }
      }
    });
  },

  onRenew() {
    wx.navigateTo({ url: '/pages/contracts/renew?id=' + this.data.contract.id });
  }
});
