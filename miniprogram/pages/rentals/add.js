// miniprogram/pages/rentals/add.js
const app = getApp();

Page({
  data: {
    contracts: [],
    selectedContract: null,
    contract_id: '',
    period: '',
    receivable: '',
    actual: '',
    payment_method: 0,
    paymentMethods: ['微信', '支付宝', '银行转账', '现金'],
    paid_date: '',
    remark: ''
  },

  onLoad() {
    this.loadContracts();
    // 默认选择当月
    const now = new Date();
    this.setData({ period: `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}` });
  },

  async loadContracts() {
    try {
      const res = await app.request({ url: '/contracts?status=1' });
      const contracts = res.data.list.map(c => ({
        id: c.id,
        label: `${c.community} - ${c.tenant_name}`,
        house: `${c.community} - ${c.address}`,
        tenant: c.tenant_name,
        monthly_rent: c.monthly_rent
      }));
      this.setData({ contracts });
    } catch (err) { console.error(err); }
  },

  onContractChange(e) {
    const contract = this.data.contracts[e.detail.value];
    this.setData({
      selectedContract: contract,
      contract_id: contract.id,
      receivable: contract.monthly_rent,
      actual: contract.monthly_rent
    });
  },

  onPeriodChange(e) { this.setData({ period: e.detail.value }); },
  onPaymentChange(e) { this.setData({ payment_method: e.detail.value }); },
  onPaidDateChange(e) { this.setData({ paid_date: e.detail.value }); },

  async onSubmit() {
    const d = this.data;
    if (!d.contract_id || !d.period || !d.receivable || !d.actual || !d.paid_date) {
      return wx.showToast({ title: '请填写必填项', icon: 'none' });
    }

    try {
      await app.request({
        url: '/rentals',
        method: 'POST',
        data: {
          contract_id: d.contract_id,
          period: d.period,
          receivable: parseFloat(d.receivable),
          actual: parseFloat(d.actual),
          payment_method: parseInt(d.payment_method) + 1,
          paid_date: d.paid_date,
          remark: d.remark
        }
      });
      wx.showToast({ title: '记收成功' });
      setTimeout(() => wx.navigateBack(), 1500);
    } catch (err) {
      wx.showToast({ title: '记收失败', icon: 'none' });
    }
  }
});
