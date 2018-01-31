import api from '../../../utils/api.js'
import util from '../../../utils/util.js'

const app = getApp()

const showLoading = app.showLoading
const showToast = app.showToast
const errToast = app.errToast

Page({
    data: {
        article: {},
        hasAudio: false,
        isPlaying: false,
        isFromShare: false
    },

    onLoad: function (option) {
        let id = option.id

        showLoading()
        api.getQuestionById({
            query: {
                id: id
            },
            success: (res) => {
                if (res.data.res === 0) {
                    let article = res.data.data
                    article.content = util.filterContent(article.answer_content)
                    //article.makettime = util.formatMakettime(article.question_makettime)
                    article.makettime = article.question_makettime.split(' ')[0]
                    article.author = article.asker
                    article.title = article.question_title

                    this.setData({
                        article: article,
                        isFromShare: option.fromShare ? true : false
                    })
                    wx.hideLoading()
                } else {
                    errToast(res.data.msg)
                }
            }
        })
    },

    onViewMore: function() {
        wx.switchTab({
            url: '/pages/read/read'
        })
    },

    //设置该页面的分享信息
    onShareAppMessage: function () {
        let id = this.data.article.content_id
        let share = this.data.article.share_list.wx

        return {
            title: share.title,
            desc: share.desc,
            path: `/pages/read/question/question?id=${id}&fromShare=1`,
            imageUrl: share.imgUrl,
            success: function (res) {
                showToast('分享成功', 'success')
            },
            fail: function (err) {
                console.log('取消转发')
            }
        }
    }
})