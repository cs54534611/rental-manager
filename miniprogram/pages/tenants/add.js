// miniprogram/pages/tenants/add.js
const app = getApp();

Page({
  data: {
    name: '',
    gender: 0,
    genders: ['女', '男'],
    phone: '',
    id_card: '',
    emergency_contact: '',
    emergency_phone: '',
    remark: ''
  },

  onLoad(options) {
    if (options.id) {
      this.setData({ id: options.id });
      this.loadTenant(options.id);
    }
  },

  async loadTenant(id) {
    if (!id) return;
    try {
      const res = await app.request({ url: '/tenants/' + id });
      const t = res.data;
      this.setData({
        name: t.name,
        gender: t.gender,
        phone: t.phone,
        id_card: t.id_card || '',
        emergency_contact: t.emergency_contact || '',
        emergency_phone: t.emergency_phone || '',
        remark: t.remark || ''
      });
    } catch (err) { console.error(err); }
  },

  onGenderChange(e) { this.setData({ gender: parseInt(e.detail.value) }); },

  async onSubmit() {
    const d = this.data;
    if (!d.name || !d.phone) {
      return wx.showToast({ title: '请填写必填项', icon: 'none' });
    }

    try {
      if (d.id) {
        await app.request({ url: '/tenants/' + d.id, method: 'PUT', data: d });
      } else {
        await app.request({ url: '/tenants', method: 'POST', data: d });
      }
      wx.showToast({ title: '保存成功' });
      setTimeout(() => wx.navigateBack(), 1500);
    } catch (err) {
      wx.showToast({ title: '保存失败', icon: 'none' });
    }
  }
});
