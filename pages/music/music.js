import api from '../../utils/api.js'
import util from '../../utils/util.js'

const app = getApp()

const showLoading = app.showLoading
const showToast = app.showToast
const errToast = app.errToast

Page({
    data: {
        musics: [],
        current: 0,
        currentMusicId: 0,
        swiperHeight: app.globalData.systemInfo.windowHeight,
        music: {},
        showDialog: false,
        shareTimelineImg: undefined
    },

    onLoad: function (option) {
        showLoading()
        api.getMusicIdList({
            success: (res) => {
                if (res.data.res === 0) {
                    let idList = res.data.data
                    this.setData({
                        musics: idList
                    })

                    this.getMusic(idList[0])
                    wx.hideLoading()
                } else {
                    errToast(res.data.msg)
                }
            }
        })
    },

    getMusic: function (id) {
        showLoading()
        api.getMusicDetailById({
            query: {
                id: id
            },
            success: (res) => {
                if (res.data.res === 0) {
                    let music = res.data.data
                    let musics = this.data.musics

                    music.contentType = 'story'
                    music.story = util.filterContent(music.story)
                    music.maketime = util.formatMakettime(music.maketime)

                    //音频状态
                    music.hasAudio = false
                    music.isPlaying = false
                    if (music.music_id.startsWith('http')) {
                        music.hasAudio = true

                        if (app.globalData.g_isPlaying && app.globalData.g_currentPlaying === id) {
                            music.isPlaying = true
                        }
                    }

                    let idx = musics.findIndex((item) => item === id)
                    musics.splice(idx, 1, music)

                    this.setData({
                        currentMusicId: id,
                        musics: musics,
                        music: music
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
            let currentMusicId = this.data.currentMusicId

            let currentPage = pages[pages.length - 1]
            if (currentPage.data.currentMusicId === currentMusicId) {
                // 打开多个book-detail页面后，每个页面不会关闭，只会隐藏。通过页面栈拿到到当前页面的bookid，只处理当前页面的音乐播放。
                if (app.globalData.g_currentPlaying == currentMusicId) {
                    // 播放当前页面音乐才改变图标
                    let musics = this.data.musics
                    let idx = musics.findIndex((item) => item.id === currentMusicId)

                    musics.forEach((item, index) => {
                        if (item.id) {
                            item.isPlaying = false
                        }
                    })

                    musics[idx].isPlaying = true
                    musics.splice(idx, 1, musics[idx])
                    this.setData({musics})
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
                    let musics = this.data.musics
                    musics.forEach((item, index) => {
                        if (item.id) {
                            item.isPlaying = false
                        }
                    })
                    this.setData({musics})
                }
            }
            app.globalData.g_isPlaying = false
            //app.globalData.g_currentPlaying = null
        });

        wx.onBackgroundAudioStop(() => {
            let musics = this.data.musics

            musics.forEach((item, index) => {
                if (item.id) {
                    item.isPlaying = false
                }
            })
            this.setData({musics})

            app.globalData.g_isPlaying = false
            //app.globalData.g_currentPlaying = null
        });
    },

    //点击播放
    onPlayTap: function (ev) {
        let currentMusicId = ev.currentTarget.dataset.id
        let musics = this.data.musics
        let idx = musics.findIndex((item) => item.id === currentMusicId)
        let isPlaying = musics[idx].isPlaying

        musics.forEach((item, index) => {
            if (item.id && item.id != currentMusicId) {
                item.isPlaying = !isPlaying
            }
        })

        musics[idx].isPlaying = !isPlaying
        musics.splice(idx, 1, musics[idx])
        this.setData({musics, currentMusicId})

        if (isPlaying) {
            wx.pauseBackgroundAudio()
            //app.globalData.g_currentPlaying = null
            app.globalData.g_isPlaying = false
        } else {
            wx.playBackgroundAudio({
                dataUrl: musics[idx].music_id,
                title: musics[idx].title
            })

            app.globalData.g_currentPlaying = currentMusicId
            app.globalData.g_isPlaying = true
        }
    },

    onHandleChange: function (ev) {
        let current = ev.detail.current
        let musics = this.data.musics
        let length = musics.length

        this.setData({current})

        if (current < length) {
            //如果需要加载数据
            if (this.needLoadNewDataAfterSwiper()) {
                this.getMusic(musics[current])
            }
        } else {
            this.setData({
                current: length
            })
            wx.navigateTo({
                url: '../history/history?page=music',
                success: () => {
                    this.setData({
                        current: length - 1
                    })
                }
            })
        }
    },

    //滚动后需不需要加载数据
    needLoadNewDataAfterSwiper: function () {
        let current = this.data.current
        let musics = this.data.musics

        return musics[current].id ? false : true;
    },

    switchContent: function (ev) {
        let id = ev.currentTarget.dataset.id
        let type = ev.target.dataset.type
        let musics = this.data.musics
        let music = musics.find((music) => music.id === id)
        music.contentType = type

        this.setData({musics})
    },

    // 查看大图片
    viewCoverImg: function (ev) {
        let src = ev.currentTarget.dataset.src;
        wx.previewImage({
            current: src,   // 当前显示图片的http链接
            urls: [src]     // 需要预览的图片http链接列表
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
                path: '/pages/music/music',
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
        let music = this.data.music
        let share = music.share_list.wx

        return {
            title: share.title,
            desc: share.desc,
            path: '/pages/music/music',
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