import api from '../../../utils/api.js'
import {bookGenere} from '../../../utils/config.js'
import WxParse from '../../wxParse/wxParse.js'

const app = getApp()

const showLoading = app.showLoading
const showToast = app.showToast
const errToast = app.errToast

Page({
    data: {
        bookData: {},
        isShow: false,
        isFromShare: false,
        isPlaying: false,
        reward: 'https://appvf.com/images/rewardCode.jpg',
        myewm: 'https://appvf.com/images/myewm.jpg',
        showDialog: false,
        shareTimelineImg: undefined
    },

    onLoad: function (option) {
        let bookId = option.id
        this.data.currentBookId = bookId

        showLoading()
        api.getBookById({
            query: {
                id: bookId
            },
            success: (res) => {
                if (res.data.status === 0) {
                    let data = res.data.data,
                        bookData = data.book,
                        recommendInfo = data.recommend

                    let article = bookData.detail
                    WxParse.wxParse('article', 'html', article, this, 5);

                    //bookData.detail = this.convertHtmlToText(bookData.detail)
                    bookData.genere = bookGenere[bookData.gid]

                    this.setData({
                        bookData: bookData,
                        isShow: true,
                        isFromShare: option.fromShare ? true : false,
                        recommendInfo: recommendInfo
                    })

                    //收藏状态
                    let booksCollected = wx.getStorageSync('books_collected')
                    let ckey = `bid${bookId}`
                    if (booksCollected) {
                        let bookCollected = booksCollected[ckey]
                        this.setData({
                            collected: bookCollected
                        })
                    } else {
                        let booksCollected = {}
                        booksCollected[ckey] = false
                        wx.setStorageSync('books_collected', booksCollected)
                    }

                    //点赞状态
                    let booksLiked = wx.getStorageSync('books_liked')
                    let lkey = `bid${bookId}`
                    if (booksLiked) {
                        let bookLiked = booksLiked[lkey]
                        this.setData({
                            liked: bookLiked
                        })
                    } else {
                        let booksLiked = {}
                        booksLiked[lkey] = false
                        wx.setStorageSync('books_liked', booksLiked)
                    }

                    //音频状态
                    if (app.globalData.g_isPlaying && app.globalData.g_currentPlaying
                        === bookId) {
                        this.setData({
                            isPlaying: true
                        })
                    }
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
            let currentBookId = this.data.currentBookId

            if (currentPage.data.currentBookId === currentBookId) {
                //打开多个book-detail页面后，每个页面不会关闭，只会隐藏。通过页面栈拿到到当前页面的bookid，只处理当前页面的音乐播放。
                if (app.globalData.g_currentPlaying == currentBookId) {
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
            let currentBookId = this.data.currentBookId

            if (currentPage.data.currentBookId === currentBookId) {
                if (app.globalData.g_currentPlaying == currentBookId) {
                    this.setData({
                        isPlaying: false
                    })
                }
            }
            app.globalData.g_isPlaying = false
            //app.globalData.g_currentMusicPostId = null
        });

        wx.onBackgroundAudioStop(() => {
            this.setData({
                isPlaying: false
            })
            app.globalData.g_isPlaying = false
            //app.globalData.g_currentMusicPostId = null
        });
    },

    // 点击进入首页
    onHomeTap: function () {
        wx.switchTab({
            url: '/pages/book/book'
        })
    },

    // 查看大图片
    viewCoverImg: function (ev) {
        let src = ev.currentTarget.dataset.src
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
            bookData = self.data.bookData

        showLoading('正在获取图片')
        api.getShareTimeline({
            data: {
                path: `/pages/book/detail/detail?id=${bookData.id}&fromShare=1`,
                image: bookData.coverimgLarge
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

    // 点击查看评论
    onCommentTap: function () {
        wx.navigateTo({
            url: `../comment/comment?doubanId=${this.data.bookData.doubanId}`
        })
    },

    // 点击收藏
    onColletionTap: function () {
        this.getBooksCollectedAsy()
    },
    getBooksCollectedAsy: function () {
        wx.getStorage({
            key: "books_collected",
            success: (res) => {
                let booksCollected = res.data
                let key = `bid${this.data.currentBookId}`
                let bookCollected = booksCollected[key]

                // 收藏变成未收藏，未收藏变成收藏
                bookCollected = !bookCollected
                booksCollected[key] = bookCollected

                // 更新文章是否收藏的缓存值
                wx.setStorageSync('books_collected', booksCollected)
                // 更新数据绑定变量，从而实现切换icon
                this.setData({
                    collected: bookCollected
                })
                wx.showToast({
                    title: bookCollected ? "收藏成功" : "已取消收藏",
                    icon: "success"
                })
            }
        })
    },

    // 点击点赞
    onLikeTap: function () {
        this.getBooksLikedAsy()
    },
    getBooksLikedAsy: function () {
        wx.getStorage({
            key: "books_liked",
            success: (res) => {
                let booksLiked = res.data
                let key = `bid${this.data.currentBookId}`
                let bookLiked = booksLiked[key]

                // 点赞变成未点赞，未点赞变成点赞
                bookLiked = !bookLiked
                booksLiked[key] = bookLiked

                // 更新文章是否点赞的缓存值
                wx.setStorageSync('books_liked', booksLiked)
                // 更新数据绑定变量，从而实现切换图片
                this.setData({
                    liked: bookLiked
                })
                wx.showToast({
                    title: bookLiked ? "点赞成功" : "已取消点赞",
                    icon: "success"
                })
            }
        })
    },

    // 点击播放
    onPlayTap: function (ev) {
        let currentBookId = this.data.currentBookId
        let bookData = this.data.bookData
        let isPlaying = this.data.isPlaying

        if (isPlaying) {
            wx.pauseBackgroundAudio()
            this.setData({
                isPlaying: false
            })
            //app.globalData.g_currentMusicPostId = null
            app.globalData.g_isPlaying = false
        } else {
            wx.playBackgroundAudio({
                dataUrl: bookData.music.url,
                title: bookData.music.title,
                coverImgUrl: bookData.music.coverImg,
            })
            this.setData({
                isPlaying: true
            })
            app.globalData.g_currentPlaying = this.data.currentBookId
            app.globalData.g_isPlaying = true
        }
    },

    // 点击进入详情页
    onBookTap: function (ev) {
        // target 和currentTarget
        // target指的是当前点击的组件 和 currentTarget 指的是事件捕获的组件
        // target这里指的是image，而currentTarget指的是swiper

        let bookId = ev.currentTarget.dataset.bookid
        wx.navigateTo({
            url: `/pages/book/detail/detail?id=${bookId}`
        })
    },

    //设置该页面的分享信息
    onShareAppMessage: function () {
        let bookData = this.data.bookData

        return {
            title: `${bookData.title} 读书笔记`,
            desc: bookData.catalog,
            path: `/pages/book/detail/detail?id=${bookData.id}&fromShare=1`,
            imageUrl: bookData.coverimgLarge,
            success: function (res) {
                showToast('分享成功', 'success')
            },
            fail: function (err) {
                console.log('取消转发')
            }
        }
    },

    convertHtmlToText: function (inputText) {
        var returnText = "" + inputText;
        returnText = returnText.replace(/<\/div>/ig, '\r\n');
        returnText = returnText.replace(/<\/li>/ig, '\r\n');
        returnText = returnText.replace(/<li>/ig, '  *  ');
        returnText = returnText.replace(/<\/ul>/ig, '\r\n');
        //-- remove BR tags and replace them with line break
        returnText = returnText.replace(/<br\s*[\/]?>/gi, "\r\n");

        //-- remove P and A tags but preserve what's inside of them
        returnText = returnText.replace(/<p.*?>/gi, "\r\n");
        returnText = returnText.replace(/<a.*href="(.*?)".*>(.*?)<\/a>/gi, " $2 ($1)");

        //-- remove all inside SCRIPT and STYLE tags
        returnText = returnText.replace(/<script.*>[\w\W]{1,}(.*?)[\w\W]{1,}<\/script>/gi, "");
        returnText = returnText.replace(/<style.*>[\w\W]{1,}(.*?)[\w\W]{1,}<\/style>/gi, "");
        //-- remove all else
        returnText = returnText.replace(/<(?:.|\s)*?>/g, "");

        //-- get rid of more than 2 multiple line breaks:
        returnText = returnText.replace(/(?:(?:\r\n|\r|\n)\s*){2,}/gim, "\r\n\r\n");

        //-- get rid of more than 2 spaces:
        returnText = returnText.replace(/ +(?= )/g, '');

        //-- get rid of html-encoded characters:
        returnText = returnText.replace(/&nbsp;/gi, " ");
        returnText = returnText.replace(/ /gi, " ");
        returnText = returnText.replace(/&/gi, "&");
        returnText = returnText.replace(/"/gi, '"');
        returnText = returnText.replace(/</gi, '<');
        returnText = returnText.replace(/>/gi, '>');

        return returnText;
   }
})