// miniprogram/pages/repairs/add.js
const app = getApp();

Page({
  data: {
    houses: [],
    selectedHouse: null,
    house_id: '',
    type: 0,
    types: ['水电', '门窗', '家电', '家具', '其他'],
    urgency: 0,
    urgencies: ['普通', '紧急', '非常紧急'],
    description: '',
    photos: [],
    expected_time: '',
    remark: ''
  },

  onLoad() {
    this.loadHouses();
  },

  async loadHouses() {
    try {
      const res = await app.request({ url: '/houses' });
      const houses = res.data.list.map(h => ({
        id: h.id,
        label: `${h.community} - ${h.address}`
      }));
      this.setData({ houses });
    } catch (err) { console.error(err); }
  },

  onHouseChange(e) {
    const house = this.data.houses[e.detail.value];
    this.setData({ selectedHouse: house, house_id: house.id });
  },

  onTypeChange(e) { this.setData({ type: e.detail.value }); },
  onUrgencyChange(e) { this.setData({ urgency: e.detail.value }); },
  onExpectedTimeChange(e) { this.setData({ expected_time: e.detail.value }); },

  // 添加照片
  addPhoto() {
    const that = this;
    wx.chooseImage({
      count: 9 - that.data.photos.length,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        that.setData({ photos: that.data.photos.concat(res.tempFilePaths) });
      }
    });
  },

  // 删除照片
  deletePhoto(e) {
    const index = e.currentTarget.dataset.index;
    const photos = this.data.photos;
    photos.splice(index, 1);
    this.setData({ photos });
  },

  async onSubmit() {
    const d = this.data;
    if (!d.house_id || !d.description) {
      return wx.showToast({ title: '请填写必填项', icon: 'none' });
    }

    try {
      await app.request({
        url: '/repairs',
        method: 'POST',
        data: {
          house_id: d.house_id,
          type: parseInt(d.type) + 1,
          urgency: parseInt(d.urgency) + 1,
          description: d.description,
          photos: d.photos,
          expected_time: d.expected_time,
          remark: d.remark
        }
      });
      wx.showToast({ title: '提交成功' });
      setTimeout(() => wx.navigateBack(), 1500);
    } catch (err) {
      wx.showToast({ title: '提交失败', icon: 'none' });
    }
  }
});
