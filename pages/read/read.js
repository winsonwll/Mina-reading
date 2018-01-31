import api from '../../utils/api.js'

const app = getApp()

const { systemInfo } = app.globalData
const showLoading = app.showLoading
const showToast = app.showToast
const errToast = app.errToast

Page({
    data: {
        carousel: [],
        articles: {},
        swiperHeight: systemInfo.windowHeight - 155,
        current: 0
    },

    onLoad: function () {
        //获取幻灯片数据
        showLoading()
        api.getCarousel({
            success: (res) => {
                if (res.data.res === 0) {
                    let carousel = res.data.data
                    this.setData({carousel})
                    //wx.hideLoading()
                } else {
                    errToast(res.data.msg)
                }
            }
        })

        //获取文字列表数据
        //showLoading()
        api.getLastArticles({
            success: (res) => {
                if (res.data.res === 0) {
                    let articles = res.data.data
                    this.setData({articles})
                    wx.hideLoading()
                } else {
                    errToast(res.data.msg)
                }
            }
        })
    },

    onEssayTap: function (ev) {
        let id = ev.currentTarget.dataset.id
        wx.navigateTo({
            url: `essay/essay?id=${id}`
        })
    },

    onSerialTap: function (ev) {
        let id = ev.currentTarget.dataset.id
        wx.navigateTo({
            url: `serial/serial?id=${id}`
        })
    },

    onQuestionTap: function (ev) {
        let id = ev.currentTarget.dataset.id
        wx.navigateTo({
            url: `question/question?id=${id}`
        })
    },

    onHandleChange: function (ev) {
        let current = ev.detail.current
        let length = this.data.articles.essay.length

        if (current === length) {
            this.setData({
                current: length
            })
            wx.navigateTo({
                url: '../history/history?page=read',
                success: () => {
                    this.setData({
                        current: length - 1
                    })
                }
            })
        }
    }
})