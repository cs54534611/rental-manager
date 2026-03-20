// miniprogram/pages/settings/owner.js
const app = getApp();

Page({
  data: {
    name: '',
    phone: '',
    id_card: '',
    emergency_contact: '',
    emergency_phone: '',
    isTenant: false
  },

  onLoad() {
    const role = app.globalData.role || wx.getStorageSync('role');
    this.setData({ isTenant: role === 'tenant' });
    this.loadOwner();
  },

  async loadOwner() {
    try {
      if (this.data.isTenant) {
        // 租客：获取当前用户信息
        const res = await app.request({ url: '/auth/me' });
        const user = res.data;
        this.setData({ 
          name: user.name || '',
          phone: user.phone || '',
          id_card: user.tenantInfo?.id_card || '',
          emergency_contact: user.tenantInfo?.emergency_contact || '',
          emergency_phone: user.tenantInfo?.emergency_phone || ''
        });
      } else {
        // 管理员：获取房东信息
        const res = await app.request({ url: '/settings/owner/info' });
        this.setData({ name: res.data.name || '', phone: res.data.phone || '' });
      }
    } catch (err) { console.error(err); }
  },

  onNameInput(e) { this.setData({ name: e.detail.value }); },
  onPhoneInput(e) { this.setData({ phone: e.detail.value }); },
  onIdCardInput(e) { this.setData({ id_card: e.detail.value }); },
  onEmergencyContactInput(e) { this.setData({ emergency_contact: e.detail.value }); },
  onEmergencyPhoneInput(e) { this.setData({ emergency_phone: e.detail.value }); },

  async onSave() {
    try {
      if (this.data.isTenant) {
        // 租客：更新租客信息
        await app.request({ url: '/tenants/' + (app.globalData.userInfo?.id || 0), method: 'PUT', data: {
          name: this.data.name,
          phone: this.data.phone,
          id_card: this.data.id_card,
          emergency_contact: this.data.emergency_contact,
          emergency_phone: this.data.emergency_phone
        }});
      } else {
        // 管理员：更新房东信息
        await app.request({ url: '/settings/owner/info', method: 'PUT', data: this.data });
      }
      wx.showToast({ title: '保存成功' });
      setTimeout(() => wx.navigateBack(), 1500);
    } catch (err) {
      wx.showToast({ title: '保存失败', icon: 'none' });
    }
  }
});
