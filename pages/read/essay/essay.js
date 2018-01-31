import api from '../../../utils/api.js'
import util from '../../../utils/util.js'

const app = getApp()

const showLoading = app.showLoading
const showToast = app.showToast
const errToast = app.errToast

Page({
    data: {
        article: {},
        hasAudio: true,
        isPlaying: false,
        isFromShare: false
    },

    onLoad: function (option) {
        let id = option.id

        showLoading()
        api.getEssayById({
            query: {
                id: id
            },
            success: (res) => {
                if (res.data.res === 0) {
                    let article = res.data.data
                    article.content = util.filterContent(article.hp_content)
                    //article.makettime = util.formatMakettime(article.hp_makettime)
                    article.makettime = article.hp_makettime.split(' ')[0]
                    article.author = article.author[0]
                    article.title = article.hp_title
                    article.charge_edt = article.hp_author_introduce

                    this.setData({
                        currentEssayId: id,
                        article: article,
                        isFromShare: option.fromShare ? true : false
                    })

                    //音频状态
                    if (article.audio.length) {
                        if (app.globalData.g_isPlaying && app.globalData.g_currentPlaying === id) {
                            this.setData({
                                isPlaying: true
                            })
                        }

                        this.setMusicMonitor()
                    } else {
                        this.setData({
                            hasAudio: false
                        })
                    }
                    wx.hideLoading()
                } else {
                    errToast(res.data.msg)
                }
            }
        })
    },

    setMusicMonitor: function () {
        //点击播放图标和总控开关都会触发这个函数
        wx.onBackgroundAudioPlay(() => {
            let pages = getCurrentPages()
            let currentPage = pages[pages.length - 1]
            let currentEssayId = this.data.currentEssayId

            if (currentPage.data.currentEssayId === currentEssayId) {
                //打开多个book-detail页面后，每个页面不会关闭，只会隐藏。通过页面栈拿到到当前页面的bookid，只处理当前页面的音乐播放。
                if (app.globalData.g_currentPlaying == currentEssayId) {
                    //播放当前页面音乐才改变图标
                    this.setData({
                        isPlaying: true
                    })
                }
            }
            app.globalData.g_isPlaying = true
        });

        wx.onBackgroundAudioPause(() => {
            let pages = getCurrentPages()
            let currentPage = pages[pages.length - 1]
            let currentEssayId = this.data.currentEssayId

            if (currentPage.data.currentEssayId === currentEssayId) {
                if (app.globalData.g_currentPlaying == currentEssayId) {
                    this.setData({
                        isPlaying: false
                    })
                }
            }
            app.globalData.g_isPlaying = false
            //app.globalData.g_currentPlaying = null
        });

        wx.onBackgroundAudioStop(() => {
            this.setData({
                isPlaying: false
            })
            app.globalData.g_isPlaying = false
            //app.globalData.g_currentPlaying = null
        });
    },

    //点击播放
    onPlayTap: function (ev) {
        let currentEssayId = this.data.currentEssayId
        let essayData = this.data.article
        let isPlaying = this.data.isPlaying

        if (isPlaying) {
            wx.pauseBackgroundAudio()
            this.setData({
                isPlaying: false
            })
            //app.globalData.g_currentPlaying = null
            app.globalData.g_isPlaying = false
        } else {
            wx.playBackgroundAudio({
                dataUrl: essayData.audio,
                title: essayData.title
            })
            this.setData({
                isPlaying: true
            })
            app.globalData.g_currentPlaying = this.data.currentEssayId
            app.globalData.g_isPlaying = true
        }
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
            path: `/pages/read/essay/essay?id=${id}&fromShare=1`,
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