// miniprogram/pages/checkout/list.js
const app = getApp();

Page({
  data: {
    list: [],
    statusList: [
      { value: '', name: '全部状态' },
      { value: '0', name: '申请中' },
      { value: '1', name: '已预约' },
      { value: '2', name: '已完成' },
      { value: '3', name: '已取消' }
    ],
    statusIndex: 0,
    statusText: '全部状态',
    selectedStatus: ''
  },

  onLoad() {
    this.loadList();
  },

  async loadList() {
    try {
      const data = {};
      if (this.data.selectedStatus) data.status = this.data.selectedStatus;
      
      const res = await app.request({ url: '/checkout', method: 'GET', data });
      if (res.code === 0) {
        this.setData({ list: res.data });
      }
    } catch (err) {
      console.error('加载失败:', err);
    }
  },

  onStatusChange(e) {
    const index = e.detail.value;
    const status = this.data.statusList[index].value;
    const name = this.data.statusList[index].name;
    this.setData({ 
      selectedStatus: status,
      statusIndex: index,
      statusText: name
    });
    this.loadList();
  },

  goToDetail(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({ url: `/pages/checkout/detail?id=${id}` });
  },

  goToAdd() {
    wx.navigateTo({ url: '/pages/checkout/add' });
  }
});
