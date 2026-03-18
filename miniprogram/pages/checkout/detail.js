// pages/checkout/detail.js
const app = getApp();

Page({
  data: {
    id: null,
    detail: {},
    statusText: '',
    
    // 弹窗状态
    showScheduleModal: false,
    showSettleModal: false,
    
    // 预约数据
    checkDate: '',
    
    // 结算数据
    depositDeduct: '',
    deductReason: '',
    refundAmount: 0
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
        const statusMap = { 0: '申请中', 1: '已预约', 2: '已完成', 3: '已拒绝' };
        const detail = res.data;
        
        this.setData({
          detail: detail,
          statusText: statusMap[detail.status] || '未知',
          refundAmount: (detail.deposit_expected || 0) - (detail.deposit_deduct || 0)
        });
      }
    } catch (err) {
      wx.showToast({ title: '加载失败', icon: 'none' });
    }
  },

  // ===== 预约弹窗 =====
  showScheduleModal() {
    this.setData({ showScheduleModal: true, checkDate: '' });
  },
  
  closeScheduleModal() {
    this.setData({ showScheduleModal: false });
  },
  
  onCheckDateChange(e) {
    this.setData({ checkDate: e.detail.value });
  },
  
  async submitSchedule() {
    if (!this.data.checkDate) {
      wx.showToast({ title: '请选择日期', icon: 'none' });
      return;
    }
    
    try {
      const res = await app.request({
        url: `/checkout/${this.data.id}/book`,
        method: 'PUT',
        data: { check_date: this.data.checkDate }
      });
      
      if (res.code === 0) {
        wx.showToast({ title: '预约成功' });
        this.setData({ showScheduleModal: false });
        this.loadDetail(this.data.id);
      }
    } catch (err) {
      wx.showToast({ title: '预约失败', icon: 'none' });
    }
  },

  // ===== 结算弹窗 =====
  showSettleModal() {
    this.setData({
      showSettleModal: true,
      depositDeduct: '',
      deductReason: '',
      refundAmount: this.data.detail.deposit_expected || 0
    });
  },
  
  closeSettleModal() {
    this.setData({ showSettleModal: false });
  },
  
  onDeductChange(e) {
    const deduct = parseFloat(e.detail.value) || 0;
    const refund = (this.data.detail.deposit_expected || 0) - deduct;
    this.setData({
      depositDeduct: e.detail.value,
      refundAmount: refund > 0 ? refund : 0
    });
  },
  
  onReasonChange(e) {
    this.setData({ deductReason: e.detail.value });
  },
  
  async submitSettle() {
    if (!this.data.depositDeduct && this.data.depositDeduct !== 0) {
      wx.showToast({ title: '请输入扣款金额', icon: 'none' });
      return;
    }
    
    try {
      const res = await app.request({
        url: `/checkout/${this.data.id}/complete`,
        method: 'PUT',
        data: {
          deposit_deduct: this.data.depositDeduct || 0,
          deduct_reason: this.data.deductReason,
          deposit_refund: this.data.refundAmount
        }
      });
      
      if (res.code === 0) {
        wx.showToast({ title: '结算完成' });
        this.setData({ showSettleModal: false });
        this.loadDetail(this.data.id);
      }
    } catch (err) {
      wx.showToast({ title: '结算失败', icon: 'none' });
    }
  },

  // ===== 拒绝/取消 =====
  handleCancel() {
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
  
  // ===== 删除 =====
  handleDelete() {
    wx.showModal({
      title: '确认删除',
      content: '确定要删除该退房记录吗？',
      success: (res) => {
        if (res.confirm) {
          this.deleteRecord();
        }
      }
    });
  },
  
  async deleteRecord() {
    try {
      const res = await app.request({
        url: `/checkout/${this.data.id}`,
        method: 'DELETE'
      });
      
      if (res.code === 0) {
        wx.showToast({ title: '删除成功' });
        setTimeout(() => wx.navigateBack(), 1500);
      }
    } catch (err) {
      wx.showToast({ title: '删除失败', icon: 'none' });
    }
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
