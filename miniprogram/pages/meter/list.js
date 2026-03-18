// miniprogram/pages/meter/list.js
const app = getApp();

Page({
  data: {
    list: [],
    houses: [],
    houseIndex: 0,
    houseText: '全部房源',
    selectedHouseId: '',
    selectedMonth: ''
  },

  onLoad() {
    this.loadHouses();
    this.loadList();
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

  async loadList() {
    try {
      const data = {};
      if (this.data.selectedHouseId) data.house_id = this.data.selectedHouseId;
      if (this.data.selectedMonth) data.period = this.data.selectedMonth;
      
      const res = await app.request({ url: '/meter', method: 'GET', data });
      if (res.code === 0) {
        this.setData({ list: res.data });
      }
    } catch (err) {
      console.error('加载失败:', err);
    }
  },

  onHouseChange(e) {
    const index = parseInt(e.detail.value);
    const house = this.data.houses[index];
    this.setData({ 
      selectedHouseId: house ? house.id : '',
      houseIndex: index,
      houseText: house ? house.address : '全部房源'
    });
    this.loadList();
  },

  onMonthChange(e) {
    this.setData({ selectedMonth: e.detail.value });
    this.loadList();
  },

  handleEdit(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({ url: `/pages/meter/add?id=${id}` });
  },

  goToAdd() {
    wx.navigateTo({ url: '/pages/meter/add' });
  }
});
