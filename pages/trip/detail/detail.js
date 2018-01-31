import api from '../../../utils/api.js'

const app = getApp()

const { systemInfo } = app.globalData
const showLoading = app.showLoading
const showToast = app.showToast
const errToast = app.errToast

Page({
    data: {
        trip: {},
        iWidth: systemInfo.windowWidth,
        isShow: false,
        isFromShare: false
    },

    onLoad: function (option) {
        let id = option.id

        showLoading()
        api.getTripInfoByID({
            query: {
                id: id
            },
            success: (res) => {
                let trip = res.data

                if(trip){
                    this.setData({
                        trip: trip,
                        isShow: true,
                        isFromShare: option.fromShare ? true : false
                    })

                    wx.hideLoading()
                } else {
                    errToast(res.data.msg)
                }
            }
        })
    },

    onViewWaypointTap: function (ev) {
        let waypoint = ev.currentTarget.dataset.waypoint
        wx.navigateTo({
            url: `../waypoint/waypoint?waypointId=${waypoint}&tripId=${this.data.trip.id}`
        })
    },

    onGotoUserTap: function (ev) {
        let id = ev.currentTarget.dataset.id
        wx.navigateTo({
            url: `../user/user?id=${id}`
        })
    },

    onViewMore: function() {
        wx.switchTab({
            url: '/pages/trip/trip'
        })
    },

    //设置该页面的分享信息
    onShareAppMessage: function () {
        let trip = this.data.trip
        return {
            title: trip.name,
            desc: trip.name,
            path: `/pages/trip/detail/detail?id=${trip.id}&fromShare=1`,
            imageUrl: trip.cover_image,
            success: function (res) {
                showToast('分享成功', 'success')
            },
            fail: function (err) {
                console.log('取消转发')
            }
        }
    }
})