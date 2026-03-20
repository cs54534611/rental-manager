// miniprogram/pages/wallet/index.js - 预付费钱包
const app = getApp();

Page({
  data: {
    balance: 0,
    autoDeduct: false,
    history: [],
    showTopup: false,
    topupAmount: '',
    tenantId: null
  },

  onLoad() {
    const userInfo = app.globalData.userInfo || {};
    this.setData({ tenantId: userInfo.tenant_id || 14 });
    this.loadWallet();
  },

  onShow() {
    this.loadWallet();
  },

  async loadWallet() {
    const tenantId = this.data.tenantId;
    try {
      const [balRes, histRes] = await Promise.all([
        app.request({ url: `/wallet/balance/${tenantId}` }),
        app.request({ url: `/wallet/history/${tenantId}` })
      ]);
      this.setData({
        balance: balRes.data?.balance || 0,
        autoDeduct: balRes.data?.auto_deduct || false,
        history: histRes.data || []
      });
    } catch (err) {
      console.error(err);
    }
  },

  showTopupModal() {
    this.setData({ showTopup: true, topupAmount: '' });
  },

  hideTopupModal() {
    this.setData({ showTopup: false });
  },

  onTopupAmountInput(e) {
    this.setData({ topupAmount: e.detail.value });
  },

  async onTopup() {
    const amount = parseFloat(this.data.topupAmount);
    if (!amount || amount <= 0) {
      return wx.showToast({ title: '请输入正确金额', icon: 'none' });
    }
    wx.showLoading({ title: '充值中...' });
    try {
      await app.request({
        url: '/wallet/topup',
        method: 'POST',
        data: { tenant_id: this.data.tenantId, amount }
      });
      wx.hideLoading();
      wx.showToast({ title: '充值成功' });
      this.hideTopupModal();
      this.loadWallet();
    } catch (err) {
      wx.hideLoading();
      wx.showToast({ title: '充值失败', icon: 'none' });
    }
  },

  async onToggleAutoDeduct(e) {
    const enabled = e.detail.value;
    try {
      await app.request({
        url: `/wallet/auto-deduct/${this.data.tenantId}`,
        method: 'PUT',
        data: { enabled }
      });
      this.setData({ autoDeduct: enabled });
      wx.showToast({ title: enabled ? '已开启自动扣款' : '已关闭自动扣款' });
    } catch (err) {
      wx.showToast({ title: '设置失败', icon: 'none' });
    }
  },

  getTypeName(type) {
    const names = { topup: '充值', deduct: '扣款', refund: '退款' };
    return names[type] || type;
  },

  getTypeClass(type) {
    return type === 'topup' ? 'text-green' : type === 'deduct' ? 'text-red' : 'text-blue';
  }
});
