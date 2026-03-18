// pages/rentals/pay.js
const app = getApp();

Page({
  data: {
    editId: null,
    contracts: [],
    contractIndex: 0,
    contractText: '',
    selectedContractId: '',
    
    period: '',
    receivable: '',
    actual: '',
    
    paymentMethods: ['微信', '支付宝', '银行转账', '现金'],
    paymentIndex: 0,
    paymentMethod: 1,
    
    paidDate: '',
    remark: ''
  },

  onLoad(options) {
    if (options.id) {
      this.setData({ editId: options.id });
      this.loadRental(options.id);
    } else {
      this.loadContracts();
    }
    // 默认选择当月
    const now = new Date();
    this.setData({ 
      period: `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
    });
  },

  async loadRental(id) {
    try {
      const res = await app.request({ url: '/rentals/' + id, method: 'GET' });
      if (res.code === 0) {
        const r = res.data;
        // 查询合同信息
        const contractsRes = await app.request({ url: '/contracts?status=1' });
        const contracts = contractsRes.data.list || [];
        
        // 查找对应合同
        const contract = contracts.find(c => c.id === r.contract_id);
        
        this.setData({
          contracts: contracts.map(c => ({
            id: c.id,
            label: `${c.community} - ${c.tenant_name}`,
            monthly_rent: c.monthly_rent
          })),
          selectedContractId: r.contract_id,
          contractText: contract ? `${contract.community} - ${contract.tenant_name}` : '',
          period: r.period,
          receivable: r.receivable,
          actual: r.actual,
          paidDate: r.paid_date,
          remark: r.remark || '',
          paymentIndex: (r.payment_method || 1) - 1,
          paymentMethod: r.payment_method || 1
        });
      }
    } catch (err) {
      console.error('加载失败:', err);
    }
  },

  async loadContracts() {
    try {
      const res = await app.request({ url: '/contracts?status=1' });
      if (res.code === 0) {
        const contracts = res.data.list.map(c => ({
          id: c.id,
          label: `${c.community} - ${c.tenant_name}`,
          house: `${c.community} - ${c.address}`,
          tenant: c.tenant_name,
          monthly_rent: c.monthly_rent
        }));
        this.setData({ contracts });
      }
    } catch (err) {
      console.error('加载合同失败:', err);
    }
  },

  onContractChange(e) {
    const index = parseInt(e.detail.value);
    const contract = this.data.contracts[index];
    if (contract) {
      this.setData({
        selectedContractId: contract.id,
        contractIndex: index,
        contractText: contract.label,
        receivable: contract.monthly_rent,
        actual: contract.monthly_rent
      });
    }
  },

  onPeriodChange(e) {
    this.setData({ period: e.detail.value });
  },

  onReceivableChange(e) {
    this.setData({ receivable: e.detail.value });
  },

  onActualChange(e) {
    this.setData({ actual: e.detail.value });
  },

  onPaymentChange(e) {
    const index = parseInt(e.detail.value);
    this.setData({
      paymentIndex: index,
      paymentMethod: index + 1
    });
  },

  onPaidDateChange(e) {
    this.setData({ paidDate: e.detail.value });
  },

  onRemarkChange(e) {
    this.setData({ remark: e.detail.value });
  },

  onSubmit() {
    const d = this.data;
    
    if (!d.selectedContractId) {
      wx.showToast({ title: '请选择房源', icon: 'none' });
      return;
    }
    if (!d.period) {
      wx.showToast({ title: '请选择租金期间', icon: 'none' });
      return;
    }
    if (!d.receivable) {
      wx.showToast({ title: '请输入应收金额', icon: 'none' });
      return;
    }
    if (!d.actual) {
      wx.showToast({ title: '请输入实收金额', icon: 'none' });
      return;
    }
    if (!d.paidDate) {
      wx.showToast({ title: '请选择实收日期', icon: 'none' });
      return;
    }

    wx.showModal({
      title: '确认记收',
      content: d.editId ? '确定要更新该租金记录吗？' : '确定要记收该租金吗？',
      success: async (res) => {
        if (res.confirm) {
          try {
            let result;
            if (d.editId) {
              // 更新
              result = await app.request({
                url: '/rentals/' + d.editId,
                method: 'PUT',
                data: {
                  receivable: parseFloat(d.receivable),
                  actual: parseFloat(d.actual),
                  payment_method: d.paymentMethod,
                  paid_date: d.paidDate,
                  remark: d.remark
                }
              });
            } else {
              // 新增
              result = await app.request({
                url: '/rentals',
                method: 'POST',
                data: {
                  contract_id: d.selectedContractId,
                  period: d.period,
                  receivable: parseFloat(d.receivable),
                  actual: parseFloat(d.actual),
                  payment_method: d.paymentMethod,
                  paid_date: d.paidDate,
                  remark: d.remark
                }
              });
            }
            
            if (result.code === 0) {
              wx.showToast({ title: d.editId ? '更新成功' : '记收成功' });
              // 返回后刷新列表
              const pages = getCurrentPages();
              const rentalPage = pages.find(p => p.route.includes('rentals/list'));
              if (rentalPage) {
                rentalPage.loadPendingStats();
              }
              setTimeout(() => wx.navigateBack(), 1500);
            } else {
              wx.showToast({ title: result.message || '操作失败', icon: 'none' });
            }
          } catch (err) {
            wx.showToast({ title: '操作失败', icon: 'none' });
          }
        }
      }
    });
  }
});
