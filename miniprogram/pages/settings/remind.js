// miniprogram/pages/settings/remind.js
const app = getApp();

Page({
  data: {
    remindRentDays: 3,
    remindContractDays: 30
  },

  onLoad() {
    this.loadSettings();
  },

  async loadSettings() {
    try {
      const res = await app.request({ url: '/settings' });
      if (res.data) {
        const rentDays = res.data.remind_rent_days || res.data.rent_reminder_days?.split(',')[0] || 0;
        const contractDays = res.data.remind_contract_days || res.data.contract_warning_days || 0;
        this.setData({
          remindRentDays: parseInt(rentDays) || 0,
          remindContractDays: parseInt(contractDays) || 0
        });
      }
    } catch (err) { console.error(err); }
  },

  onToggleRemind(e) {
    this.setData({ remindRentDays: e.detail.value ? 3 : 0 });
  },

  onDaysChange(e) {
    const days = [1, 3, 5, 7][e.detail.value];
    this.setData({ remindRentDays: days });
  },

  onToggleContract(e) {
    this.setData({ remindContractDays: e.detail.value ? 30 : 0 });
  },

  onContractDaysChange(e) {
    const days = [7, 14, 30][e.detail.value];
    this.setData({ remindContractDays: days });
  },

  async onSave() {
    try {
      await app.request({ url: '/settings/rent_reminder_days', method: 'PUT', data: { value: this.data.remindRentDays > 0 ? '7,3,1' : '' } });
      await app.request({ url: '/settings/contract_warning_days', method: 'PUT', data: { value: this.data.remindContractDays > 0 ? String(this.data.remindContractDays) : '' } });
      wx.showToast({ title: '保存成功' });
    } catch (err) {
      wx.showToast({ title: '保存失败', icon: 'none' });
    }
  }
});
