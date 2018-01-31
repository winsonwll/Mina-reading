import api from '../../../utils/api.js'

const app = getApp()

const showLoading = app.showLoading
const errToast = app.errToast

Page({
    data: {
        title: '',
        musics: []
    },

    onLoad: function (options) {
        this.setData({
            title: `${options.title} 音乐列表`
        })

        showLoading()
        api.getMusicsByMonth({
            query: {
                month: options.month
            },
            success: (res) => {
                if (res.data.res === 0) {
                    let musics = res.data.data
                    this.setData({musics})
                    wx.hideLoading()
                } else {
                    errToast(res.data.msg)
                }
            }
        })
    },

    onReady: function () {
        wx.setNavigationBarTitle({
            title: this.data.title
        })
    },

    onHandleTap: function (ev) {
        let id = ev.currentTarget.dataset.id
        wx.navigateTo({
            url: `../detail/detail?id=${id}`
        })
    }
})