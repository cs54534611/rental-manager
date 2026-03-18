// pages/checkout/add.js
const app = getApp();

Page({
  data: {
    contracts: [],
    contractIndex: 0,
    contractText: '',
    selectedContractId: '',
    checkoutDate: '',
    deposit: '',
    remark: ''
  },

  onLoad() {
    this.loadContracts();
  },

  async loadContracts() {
    try {
      const res = await app.request({ url: '/contracts', data: { status: 1 } });
      if (res.code === 0) {
        this.setData({ contracts: res.data.list || [] });
      }
    } catch (err) {
      console.error('加载合同失败:', err);
    }
  },

  onContractChange(e) {
    const index = parseInt(e.detail.value);
    const contract = this.data.contracts[index];
    if (contract) {
      // 格式化日期为 YYYY-MM-DD
      let endDate = '';
      if (contract.end_date) {
        endDate = contract.end_date.split('T')[0];
      }
      this.setData({
        selectedContractId: contract.id,
        contractIndex: index,
        contractText: contract.contract_no + ' - ' + contract.address,
        deposit: contract.deposit || '',
        checkoutDate: endDate
      });
    }
  },

  onDateChange(e) {
    this.setData({ checkoutDate: e.detail.value });
  },

  onDepositChange(e) {
    this.setData({ deposit: e.detail.value });
  },

  onRemarkChange(e) {
    this.setData({ remark: e.detail.value });
  },

  handleSubmit() {
    const { selectedContractId, checkoutDate, deposit } = this.data;
    
    if (!selectedContractId) {
      wx.showToast({ title: '请选择合同', icon: 'none' });
      return;
    }
    if (!checkoutDate) {
      wx.showToast({ title: '请选择退房日期', icon: 'none' });
      return;
    }
    if (!deposit) {
      wx.showToast({ title: '请输入押金金额', icon: 'none' });
      return;
    }

    wx.showModal({
      title: '确认提交',
      content: '确定要提交退房申请吗？',
      success: async (res) => {
        if (res.confirm) {
          try {
            const data = {
              contract_id: selectedContractId,
              checkout_date: checkoutDate,  // YYYY-MM-DD 格式
              deposit_expected: deposit,
              remark: this.data.remark
            };
            
            const result = await app.request({ url: '/checkout', method: 'POST', data });
            
            if (result.code === 0) {
              wx.showToast({ title: '提交成功' });
              setTimeout(() => wx.navigateBack(), 1500);
            } else {
              wx.showToast({ title: result.message || '提交失败', icon: 'none' });
            }
          } catch (err) {
            wx.showToast({ title: '提交失败', icon: 'none' });
          }
        }
      }
    });
  }
});
