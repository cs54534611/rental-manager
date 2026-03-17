// miniprogram/pages/houses/add.js
const app = getApp();

Page({
  data: {
    community: '',
    address: '',
    layout: '',
    area: '',
    floor: '',
    totalFloor: '',
    orientation: '',
    decoration: '',
    rent: '',
    deposit: '',
    facilities: [],
    photos: [],
    remark: '',
    layouts: ['1室0厅', '1室1厅', '2室0厅', '2室1厅', '2室2厅', '3室1厅', '3室2厅', '4室2厅', '4室3厅', '5室2厅'],
    orientations: ['东', '南', '西', '北', '东南', '东北', '西南', '西北', '南北'],
    decorations: ['精装', '简装', '毛坯'],
    facilityOptions: ['空调', '冰箱', '洗衣机', '热水器', '床', '沙发', '电视', '宽带', '衣柜', '燃气', '电梯', '停车位']
  },

  onLoad(options) {
    if (options.id) {
      this.setData({ id: options.id });
      this.loadHouse(options.id);
    }
  },

  async loadHouse(id) {
    if (!id) return;
    try {
      const res = await app.request({ url: '/houses/' + id });
      const h = res.data;
      this.setData({
        community: h.community,
        address: h.address,
        layout: h.layout,
        area: h.area,
        floor: h.floor.split('/')[0],
        totalFloor: h.floor.split('/')[1],
        orientation: h.orientation,
        decoration: h.decoration,
        rent: h.rent,
        deposit: h.deposit,
        facilities: h.facilities || [],
        remark: h.remark || ''
      });
    } catch (err) {
      console.error(err);
    }
  },

  onLayoutChange(e) { this.setData({ layout: this.data.layouts[e.detail.value] }); },
  onOrientationChange(e) { this.setData({ orientation: this.data.orientations[e.detail.value] }); },
  onDecorationChange(e) { this.setData({ decoration: this.data.decorations[e.detail.value] }); },

  toggleFacility(e) {
    const idx = e.currentTarget.dataset.idx;
    const item = this.data.facilityOptions[idx];
    let arr = this.data.facilities || [];
    if (!Array.isArray(arr)) arr = [];
    
    if (arr.includes(item)) {
      arr = arr.filter(f => f !== item);
    } else {
      arr.push(item);
    }
    this.setData({ facilities: arr });
  },

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
    if (!d.community || !d.address || !d.layout || !d.area || !d.rent || !d.deposit) {
      return wx.showToast({ title: '请填写必填项', icon: 'none' });
    }

    const floor = d.floor && d.totalFloor ? `${d.floor}/${d.totalFloor}` : d.floor;
    const data = {
      community: d.community,
      address: d.address,
      layout: d.layout,
      area: parseFloat(d.area),
      floor: floor,
      orientation: d.orientation,
      decoration: d.decoration,
      rent: parseFloat(d.rent),
      deposit: parseFloat(d.deposit),
      facilities: d.facilities,
      photos: d.photos,
      remark: d.remark
    };

    try {
      if (d.id) {
        await app.request({ url: '/houses/' + d.id, method: 'PUT', data });
        wx.showToast({ title: '更新成功' });
      } else {
        await app.request({ url: '/houses', method: 'POST', data });
        wx.showToast({ title: '添加成功' });
      }
      setTimeout(() => wx.navigateBack(), 1500);
    } catch (err) {
      wx.showToast({ title: '操作失败', icon: 'none' });
    }
  }
});
