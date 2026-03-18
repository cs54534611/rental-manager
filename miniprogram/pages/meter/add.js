// miniprogram/pages/meter/add.js
const app = getApp();

Page({
  data: {
    id: null,
    houses: [],
    houseIndex: 0,
    houseText: '',
    selectedHouseId: '',
    period: '',
    water_last: '',
    water_current: '',
    water_rate: '3.5',
    water_usage: 0,
    water_fee: 0,
    electric_last: '',
    electric_current: '',
    electric_rate: '0.5',
    electric_usage: 0,
    electric_fee: 0,
    remark: ''
  },

  onLoad(options) {
    if (options.id) {
      this.setData({ id: parseInt(options.id) });
      this.loadDetail(options.id);
    }
    this.loadHouses();
  },

  async loadHouses() {
    try {
      const res = await app.request({ url: '/houses', method: 'GET' });
      if (res.code === 0) {
        this.setData({ houses: res.data.list || res.data });
      }
    } catch (err) {
      console.error('加载房源失败:', err);
    }
  },

  async loadDetail(id) {
    if (this.data.houses.length === 0) {
      await this.loadHouses();
    }
    
    try {
      const res = await app.request({ url: `/meter/${id}`, method: 'GET' });
      if (res.code === 0) {
        const item = res.data;
        const houseIndex = this.data.houses.findIndex(h => h.id === item.house_id);
        this.setData({
          selectedHouseId: item.house_id,
          houseIndex: houseIndex >= 0 ? houseIndex : 0,
          houseText: this.data.houses[houseIndex]?.address || '',
          period: item.period,
          water_last: item.water_last,
          water_current: item.water_current,
          water_rate: item.water_rate,
          water_usage: item.water_usage,
          water_fee: item.water_fee,
          electric_last: item.electric_last,
          electric_current: item.electric_current,
          electric_rate: item.electric_rate,
          electric_usage: item.electric_usage,
          electric_fee: item.electric_fee,
          remark: item.remark
        });
      }
    } catch (err) {
      console.error('加载详情失败:', err);
    }
  },

  onHouseChange(e) {
    const index = parseInt(e.detail.value);
    const house = this.data.houses[index];
    this.setData({ 
      selectedHouseId: house ? house.id : '',
      houseIndex: index,
      houseText: house ? house.address : ''
    });
  },

  onPeriodChange(e) {
    this.setData({ period: e.detail.value });
  },

  onWaterLastChange(e) { this.setData({ water_last: e.detail.value }); this.calculate(); },
  onWaterCurrentChange(e) { this.setData({ water_current: e.detail.value }); this.calculate(); },
  onWaterRateChange(e) { this.setData({ water_rate: e.detail.value }); this.calculate(); },
  onElectricLastChange(e) { this.setData({ electric_last: e.detail.value }); this.calculate(); },
  onElectricCurrentChange(e) { this.setData({ electric_current: e.detail.value }); this.calculate(); },
  onElectricRateChange(e) { this.setData({ electric_rate: e.detail.value }); this.calculate(); },
  onRemarkChange(e) { this.setData({ remark: e.detail.value }); },

  calculate() {
    const water_usage = (parseFloat(this.data.water_current) || 0) - (parseFloat(this.data.water_last) || 0);
    const water_fee = water_usage * (parseFloat(this.data.water_rate) || 0);
    const electric_usage = (parseFloat(this.data.electric_current) || 0) - (parseFloat(this.data.electric_last) || 0);
    const electric_fee = electric_usage * (parseFloat(this.data.electric_rate) || 0);

    this.setData({
      water_usage: water_usage > 0 ? water_usage : 0,
      water_fee: water_fee.toFixed(2),
      electric_usage: electric_usage > 0 ? electric_usage : 0,
      electric_fee: electric_fee.toFixed(2)
    });
  },

  async handleSubmit(e) {
    const { selectedHouseId, period, id } = this.data;
    if (!selectedHouseId || !period) {
      wx.showToast({ title: '请完善信息', icon: 'none' });
      return;
    }

    this.calculate();

    const data = {
      house_id: selectedHouseId,
      period,
      water_last: this.data.water_last || 0,
      water_current: this.data.water_current || 0,
      water_rate: this.data.water_rate || 3.5,
      water_usage: this.data.water_usage,
      water_fee: this.data.water_fee,
      electric_last: this.data.electric_last || 0,
      electric_current: this.data.electric_current || 0,
      electric_rate: this.data.electric_rate || 0.5,
      electric_usage: this.data.electric_usage,
      electric_fee: this.data.electric_fee,
      total_fee: (parseFloat(this.data.water_fee) + parseFloat(this.data.electric_fee)).toFixed(2),
      remark: this.data.remark
    };

    try {
      let res;
      if (id) {
        res = await app.request({ url: `/meter/${id}`, method: 'PUT', data });
      } else {
        res = await app.request({ url: '/meter', method: 'POST', data });
      }

      if (res.code === 0) {
        wx.showToast({ title: '保存成功' });
        setTimeout(() => wx.navigateBack(), 1500);
      } else {
        wx.showToast({ title: res.message || '保存失败', icon: 'none' });
      }
    } catch (err) {
      wx.showToast({ title: '保存失败', icon: 'none' });
    }
  }
});
