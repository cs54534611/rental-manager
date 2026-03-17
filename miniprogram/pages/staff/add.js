// miniprogram/pages/staff/add.js
const app = getApp();

Page({
  data: {
    name: '',
    phone: '',
    specialty: '',
    remark: '',
    id: ''
  },

  onLoad(options) {
    if (options.id) {
      this.setData({ id: options.id });
      this.loadStaff(options.id);
    }
  },

  async loadStaff(id) {
    try {
      const res = await app.request({ url: '/staff/' + id });
      const s = res.data;
      this.setData({ name: s.name, phone: s.phone, specialty: s.specialty || '', remark: s.remark || '' });
    } catch (err) {
      console.error(err);
    }
  },

  async onSubmit() {
    const d = this.data;
    if (!d.name || !d.phone) {
      return wx.showToast({ title: '请填写必填项', icon: 'none' });
    }

    try {
      if (d.id) {
        await app.request({ url: '/staff/' + d.id, method: 'PUT', data: d });
      } else {
        await app.request({ url: '/staff', method: 'POST', data: d });
      }
      wx.showToast({ title: '保存成功' });
      setTimeout(() => wx.navigateBack(), 1500);
    } catch (err) {
      wx.showToast({ title: '保存失败', icon: 'none' });
    }
  }
});
