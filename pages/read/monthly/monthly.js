import api from '../../../utils/api.js'

const app = getApp()

const showLoading = app.showLoading
const showToast = app.showToast
const errToast = app.errToast

Page({
    data: {
        type: '',
        title: '',
        articles: []
    },

    onLoad: function (options) {
        let {type, month} = options

        this.setData({
            type: type,
            title: month
        })

        showLoading()
        api.getArticlesByMonth({
            query: {
                type: type,
                month: month
            },
            success: (res) => {
                if (res.data.res === 0) {
                    let articles = res.data.data
                    this.setData({
                        articles: articles
                    })
                    wx.hideLoading()
                } else {
                    errToast(res.data.msg)
                }
            }
        })
    },

    onReady: function () {
        let name = ''

        switch (this.data.type) {
            case 'essay':
                name = '短篇'
                break;
            case 'serialcontent':
                name = '连载'
                break;
            case 'question':
                name = '问答'
                break;
        }

        wx.setNavigationBarTitle({
            title: `${this.data.title} ${name}列表`
        })
    },

    onEssayTap: function (ev) {
        let id = ev.currentTarget.dataset.id
        wx.navigateTo({
            url: `../essay/essay?id=${id}`
        })
    },

    onSerialTap: function (ev) {
        let id = ev.currentTarget.dataset.id
        wx.navigateTo({
            url: `../serial/serial?id=${id}`
        })
    },

    onQuestionTap: function (ev) {
        let id = ev.currentTarget.dataset.id
        wx.navigateTo({
            url: `../question/question?id=${id}`
        })
    }
})
