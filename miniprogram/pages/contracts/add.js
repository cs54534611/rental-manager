// miniprogram/pages/contracts/add.js
const app = getApp();

Page({
  data: {
    houses: [],
    tenants: [],
    selectedHouse: null,
    selectedTenant: null,
    house_id: '',
    tenant_id: '',
    type: 0,
    types: ['新签', '续签', '转租'],
    start_date: '',
    end_date: '',
    monthly_rent: '',
    payment_method: 0,
    paymentMethods: ['押一付三', '押一付一', '半年付', '年付'],
    deposit: '',
    remark: ''
  },

  onLoad() {
    this.loadHouses();
    this.loadTenants();
  },

  async loadHouses() {
    try {
      const res = await app.request({ url: '/houses?status=0' });
      const houses = res.data.list.map(h => ({
        id: h.id,
        label: `${h.community} - ${h.address}`,
        rent: h.rent,
        deposit: h.deposit
      }));
      this.setData({ houses });
    } catch (err) { console.error(err); }
  },

  async loadTenants() {
    try {
      const res = await app.request({ url: '/tenants?status=1' });
      this.setData({ tenants: res.data.list });
    } catch (err) { console.error(err); }
  },

  onHouseChange(e) {
    const house = this.data.houses[e.detail.value];
    this.setData({
      selectedHouse: house,
      house_id: house.id,
      monthly_rent: house.rent,
      deposit: house.deposit
    });
  },

  onTenantChange(e) {
    const tenant = this.data.tenants[e.detail.value];
    this.setData({ selectedTenant: tenant, tenant_id: tenant.id });
  },

  onTypeChange(e) { this.setData({ type: e.detail.value }); },
  onStartDateChange(e) { this.setData({ start_date: e.detail.value }); },
  onEndDateChange(e) { this.setData({ end_date: e.detail.value }); },
  onPaymentChange(e) { this.setData({ payment_method: e.detail.value }); },

  async onSubmit() {
    const d = this.data;
    if (!d.house_id || !d.tenant_id || !d.start_date || !d.end_date || !d.monthly_rent || !d.deposit) {
      return wx.showToast({ title: '请填写必填项', icon: 'none' });
    }

    try {
      await app.request({
        url: '/contracts',
        method: 'POST',
        data: {
          house_id: d.house_id,
          tenant_id: d.tenant_id,
          type: parseInt(d.type) + 1,
          start_date: d.start_date,
          end_date: d.end_date,
          monthly_rent: parseFloat(d.monthly_rent),
          payment_method: parseInt(d.payment_method) + 1,
          deposit: parseFloat(d.deposit),
          remark: d.remark
        }
      });
      wx.showToast({ title: '创建成功' });
      setTimeout(() => wx.navigateBack(), 1500);
    } catch (err) {
      wx.showToast({ title: '创建失败', icon: 'none' });
    }
  }
});
