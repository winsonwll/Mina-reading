import api from '../../../utils/api.js'
import util from '../../../utils/util.js'

const app = getApp()

const { systemInfo } = app.globalData
const showLoading = app.showLoading
const showToast = app.showToast
const errToast = app.errToast

Page({
    data: {
        trips: [],
        user_info: null,
        windowWidth: systemInfo.windowWidth,
        isFromShare: false
    },

    onLoad: function (option) {
        let userId = option.id

        showLoading()
        api.getUserInfoByID({
            query: {
                userId
            },
            success: (res) => {
                let trips = res.data.trips

                if(trips){
                    trips.map((item) => {
                        item.date_added = util.formatTime(new Date(item.date_added * 1000), 1)
                        return item
                    })

                    this.setData({
                        trips,
                        user_info: res.data.user_info,
                        isFromShare: option.fromShare ? true : false
                    })

                    wx.setNavigationBarTitle({
                        title: res.data.user_info.name
                    })

                    wx.hideLoading()
                } else {
                    errToast(res.data.msg)
                }
            }
        })
    },

    onViewTripTap: function (ev) {
        let id = ev.currentTarget.dataset.id
        wx.navigateTo({
            url: `../detail/detail?id=${id}`
        })
    },

    onViewMore: function() {
        wx.switchTab({
            url: '/pages/trip/trip'
        })
    },

    //设置该页面的分享信息
    onShareAppMessage: function () {
        let trip = this.data.user_info
        return {
            title: `${trip.name} 的游记`,
            desc: `${trip.name} 的游记`,
            path: `/pages/trip/user/user?id=${trip.id}&fromShare=1`,
            imageUrl: trip.cover,
            success: function (res) {
                showToast('分享成功', 'success')
            },
            fail: function (err) {
                console.log('取消转发')
            }
        }
    }
})