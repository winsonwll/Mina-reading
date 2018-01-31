import api from '../../../utils/api.js'
import util from '../../../utils/util.js'

const app = getApp()

const { systemInfo } = app.globalData
const showLoading = app.showLoading
const showToast = app.showToast
const errToast = app.errToast

const formatTime = util.formatTime

Page({
    data: {
        isShow: false,
        isFromShare: false,
        waypoint: {},
        replies: {
            recommender_count: 0,
            recommenders: [],
            comments: [],
            comment_count: 0
        },
        iWidth: systemInfo.windowWidth
    },

    onLoad: function (option) {
        let tripId = option.tripId
        let waypointId = option.waypointId
        let fromShare = option.fromShare ? true : false
        
        this.getWaypointDetail(tripId, waypointId, fromShare)
    },

    getWaypointDetail: function (tripId, waypointId, fromShare) {
        showLoading()
        api.getWaypointInfoByID({
            query: {
                tripId,
                waypointId
            },
            success: (res) => {
                let waypoint = res.data

                if(waypoint){
                    this.setData({
                        isShow: true,
                        isFromShare: fromShare,
                        waypoint:waypoint
                    })
                    if (waypoint.comments > 0) {
                        this.getWaypointReplies(tripId, waypointId)
                    }

                    wx.hideLoading()
                } else {
                    errToast(res.data.msg)
                }
            }
        })
    },

    getWaypointReplies: function (tripId, waypointId) {
        showLoading()
        api.getWaypointReplyByID({
            query: {
                tripId,
                waypointId
            },
            success: (res) => {
                let replies = res.data

                if(replies){
                    replies.comments.map((item) => {
                        item.date_added = formatTime(new Date(item.date_added * 1000), 2)
                        return item
                    })
                    this.setData({replies})

                    wx.hideLoading()
                } else {
                    errToast(res.data.msg)
                }
            }
        })
    },

    onGotoUserTap: function (ev) {
        let id = ev.currentTarget.dataset.id
        wx.navigateTo({
            url: `../user/user?id=${id}`
        })
    },

    // 查看大图片
    viewPreviewImg: function (ev) {
        let src = ev.currentTarget.dataset.src
        wx.previewImage({
            current: src,   // 当前显示图片的http链接
            urls: [src]     // 需要预览的图片http链接列表
        })
    },

    onViewMore: function() {
        wx.switchTab({
            url: '/pages/trip/trip'
        })
    },

    //设置该页面的分享信息
    onShareAppMessage: function () {
        let waypoint = this.data.waypoint
        let desc = waypoint.text.length > 40 ? `${waypoint.text.substr(0,40)}...` : waypoint.text
        
        return {
            title: waypoint.trip_name,
            desc: desc,
            path: `/pages/trip/waypoint/waypoint?waypointId=${waypoint.id}&tripId=${waypoint.trip_id}&fromShare=1`,
            imageUrl: waypoint.photo_w640,
            success: function (res) {
                showToast('分享成功', 'success')
            },
            fail: function (err) {
                console.log('取消转发')
            }
        }
    }
})