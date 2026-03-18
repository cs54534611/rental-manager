// miniprogram/pages/repairs/list.js
const app = getApp();

Page({
  data: {
    repairs: [],
    status: '',
    typeMap: { 1: '水电', 2: '门窗', 3: '家电', 4: '家具', 5: '其他' },
    urgencyMap: { 1: '普通', 2: '紧急', 3: '非常紧急' },
    statusMap: { 0: '待受理', 1: '已受理', 2: '已派单', 3: '处理中', 4: '待确认', 5: '已完成', 6: '已评价' }
  },

  onLoad(options) {
    if (options.status) {
      this.setData({ status: parseInt(options.status) });
    }
    this.loadRepairs();
  },

  onShow() {
    this.loadRepairs();
  },

  async loadRepairs() {
    try {
      const res = await app.request({ url: '/repairs', data: { status: this.data.status } });
      this.setData({ repairs: res.data.list });
    } catch (err) { console.error(err); }
  },

  onFilter(e) {
    const status = e.currentTarget.dataset.status;
    this.setData({ status: status });
    this.loadRepairs();
  },

  goToDetail(e) {
    wx.navigateTo({ url: '/pages/repairs/detail?id=' + e.currentTarget.dataset.id });
  },

  onDelete(e) {
    const id = e.currentTarget.dataset.id;
    wx.showModal({
      title: '确认删除',
      content: '确定要删除该报修记录吗？',
      success: async (res) => {
        if (res.confirm) {
          try {
            await app.request({ url: '/repairs/' + id, method: 'DELETE' });
            wx.showToast({ title: '删除成功' });
            this.loadRepairs();
          } catch (err) {
            wx.showToast({ title: '删除失败', icon: 'none' });
          }
        }
      }
    });
  },

  goToAdd() {
    wx.navigateTo({ url: '/pages/repairs/add' });
  }
});
