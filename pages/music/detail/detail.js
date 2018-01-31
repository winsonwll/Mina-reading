import api from '../../../utils/api.js'
import util from '../../../utils/util.js'

const app = getApp()

const showLoading = app.showLoading
const showToast = app.showToast
const errToast = app.errToast

Page({
    data: {
        music: [],
        currentMusicId: 0,
        isFromShare: false,
        showDialog: false,
        shareTimelineImg: undefined
    },

    onLoad: function (option) {
        let id = option.id

        showLoading()
        api.getMusicDetailById({
            query: {
                id: id
            },
            success: (res) => {
                if (res.data.res === 0) {
                    let music = res.data.data

                    music.contentType = 'story'
                    music.story = util.filterContent(music.story)
                    music.maketime = util.formatMakettime(music.maketime)
                    //音频状态
                    music.hasAudio = false
                    music.isPlaying = false
                    if (music.music_id.startsWith("http")) {
                        music.hasAudio = true

                        if (app.globalData.g_isPlaying && app.globalData.g_currentPlaying === id) {
                            music.isPlaying = true
                        }
                    }

                    this.setData({
                        currentMusicId: id,
                        music: music,
                        isFromShare: option.fromShare ? true : false
                    })

                    this.setMusicMonitor()
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
            let currentMusicId = this.data.currentMusicId

            if (currentPage.data.currentMusicId === currentMusicId) {
                // 打开多个book-detail页面后，每个页面不会关闭，只会隐藏。通过页面栈拿到到当前页面的bookid，只处理当前页面的音乐播放。
                if (app.globalData.g_currentPlaying == currentMusicId) {
                    // 播放当前页面音乐才改变图标
                    let music = this.data.music
                    music.isPlaying = true
                    this.setData({music})
                }
            }
            app.globalData.g_isPlaying = true
        });

        wx.onBackgroundAudioPause(() => {
            let pages = getCurrentPages()
            let currentPage = pages[pages.length - 1]
            let currentMusicId = this.data.currentMusicId

            if (currentPage.data.currentMusicId === currentMusicId) {
                if (app.globalData.g_currentPlaying == currentMusicId) {
                    let music = this.data.music
                    music.isPlaying = false
                    this.setData({music})
                }
            }
            app.globalData.g_isPlaying = false
            //app.globalData.g_currentMusicPostId = null;
        });

        wx.onBackgroundAudioStop(() => {
            let music = this.data.music
            music.isPlaying = false
            this.setData({music})

            app.globalData.g_isPlaying = false
            //app.globalData.g_currentMusicPostId = null
        });
    },

    //点击播放
    onPlayTap: function (ev) {
        let currentMusicId = ev.currentTarget.dataset.id
        let music = this.data.music
        let isPlaying = music.isPlaying

        music.isPlaying = !isPlaying
        this.setData({music})

        if (isPlaying) {
            wx.pauseBackgroundAudio()
            //app.globalData.g_currentPlaying = null
            app.globalData.g_isPlaying = false
        } else {
            wx.playBackgroundAudio({
                dataUrl: music.music_id,
                title: music.title
            })

            app.globalData.g_currentPlaying = currentMusicId
            app.globalData.g_isPlaying = true
        }
    },

    switchContent: function (ev) {
        let type = ev.target.dataset.type
        let music = this.data.music

        music.contentType = type
        this.setData({music})
    },

    // 查看大图片
    viewCoverImg: function (ev) {
        let src = ev.currentTarget.dataset.src
        wx.previewImage({
            current: src,   // 当前显示图片的http链接
            urls: [src]     // 需要预览的图片http链接列表
        })
    },

    onViewMore: function() {
        wx.switchTab({
            url: '/pages/music/music'
        })
    },

    toggleDialog: function () {
        this.setData({
            showDialog: false,
            shareTimelineImg: undefined
        })
    },

    onShareTimelineTap: function () {
        let self = this,
            music = self.data.music

        showLoading('正在获取图片')
        api.getShareTimeline({
            data: {
                path: `/pages/music/detail/detail?id=${music.id}&fromShare=1`,
                image: music.cover
            },
            success: (res) => {
                if (res.data.status === 0) {
                    self.setData({
                        showDialog: true,
                        shareTimelineImg: res.data.data
                    })

                    self.saveImage()

                    wx.hideLoading()
                } else {
                    errToast(res.data.msg)
                }
            }
        })
    },

    saveImage: function () {
        // 图片保存到本地
        wx.downloadFile({
            url: this.data.shareTimelineImg,
            success: (res) => {
                wx.saveImageToPhotosAlbum({
                    filePath: res.tempFilePath,
                    success: (res) => {
                        //showToast('保存成功', 'success')
                    },
                    fail: (err) => {
                        if (err.errMsg === "saveImageToPhotosAlbum:fail auth deny") {
                            // 用户一开始拒绝了，再次发起授权，打开设置窗口
                            wx.openSetting({
                                success: (settingdata) => {
                                    if (settingdata.authSetting['scope.writePhotosAlbum']) {
                                        showToast('获取权限成功，您可以再次长按图片保存', 'success')
                                    } else {
                                        errToast('获取权限失败，没有您的授权无法保存图片')
                                    }
                                }
                            })
                        } else {
                            errToast('保存失败')
                        }
                    }
                })
            },
            fail: (err) => {
                errToast('下载失败')
            }
        })
    },

    //设置该页面的分享信息
    onShareAppMessage: function () {
        let music = this.data.music,
            share = music.share_list.wx

        return {
            title: share.title,
            desc: share.desc,
            path: `/pages/music/detail/detail?id=${music.id}&fromShare=1`,
            imageUrl: music.cover,
            success: function (res) {
                showToast('分享成功', 'success')
            },
            fail: function (err) {
                console.log('取消转发')
            }
        }
    }
})