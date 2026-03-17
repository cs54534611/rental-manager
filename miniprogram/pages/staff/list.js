// miniprogram/pages/staff/list.js
const app = getApp();

Page({
  data: {
    list: [],
    keyword: ''
  },

  onLoad() {
    this.loadList();
  },

  onShow() {
    this.loadList();
  },

  async loadList() {
    try {
      const res = await app.request({ url: '/staff', data: { keyword: this.data.keyword } });
      this.setData({ list: res.data });
    } catch (err) {
      console.error(err);
    }
  },

  onSearch(e) {
    this.setData({ keyword: e.detail.value });
    this.loadList();
  },

  onDetail(e) {
    wx.navigateTo({ url: '/pages/staff/add?id=' + e.currentTarget.dataset.id });
  },

  onAdd() {
    wx.navigateTo({ url: '/pages/staff/add' });
  },

  onDelete(e) {
    const id = e.currentTarget.dataset.id;
    wx.showModal({
      title: '确认删除',
      content: '确定要删除该维修人员吗？',
      success: async (res) => {
        if (res.confirm) {
          try {
            await app.request({ url: '/staff/' + id, method: 'DELETE' });
            wx.showToast({ title: '删除成功' });
            this.loadList();
          } catch (err) {
            wx.showToast({ title: '删除失败', icon: 'none' });
          }
        }
      }
    });
  }
});
