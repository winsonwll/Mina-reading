import api from './utils/api.js'

App({
    onLaunch: function () {
        console.log('初始化成功')

        let userInfo = wx.getStorageSync('userInfo')
        if (!userInfo) {
            // 登录
            this.login()
        }

        // 获取用户信息
        /*wx.getSetting({
            success: (res) => {
                if (res.authSetting['scope.userInfo']) {
                    // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
                    wx.getUserInfo({
                        success: (res) => {
                            // 可以将 res 发送给后台解码出 unionId
                            this.globalData.userInfo = res.userInfo

                            // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
                            // 所以此处加入 callback 以防止这种情况
                            if (this.userInfoReadyCallback) {
                                this.userInfoReadyCallback(res)
                            }
                        }
                    })
                }

                // 获取相册授权
                if (!res.authSetting['scope.writePhotosAlbum']) {
                    wx.authorize({
                        scope: 'scope.writePhotosAlbum',
                        success() {
                            console.log('授权成功')
                        }
                    })
                }
            }
        })*/
    },

    onShow: function () {
        console.log('页面显示')
    },

    onHide: function () {
        console.log('页面隐藏')
    },

    //授权登录
    login: function () {
        let self =this
        wx.login({
            success: (res) => {
                let code = res.code
                if (code) {
                    wx.getUserInfo({
                        success: (result) => {
                            let userInfo = result.userInfo

                            // 发送 res.code 到后台换取 openId, sessionKey, unionId
                            api.getLogin({
                                data: {
                                    code: code,
                                    userInfo: userInfo
                                },
                                success: (ress) => {
                                    if (ress.data.status === 0) {
                                        let uid = ress.data.data

                                        self.globalData.userInfo = userInfo
                                        wx.setStorageSync('userInfo', userInfo)
                                        /*wx.setStorage({
                                            key: 'uid',
                                            data: uid,
                                            success: (r) => {}
                                        })*/
                                    }
                                }
                            })
                        },
                        fail: function () {
                            wx.showModal({
                                title: '警告',
                                content: '您点击了拒绝授权，将无法正常使用功能体验。请10分钟后再次点击授权，或者删除小程序重新进入。',
                                success: function (res) {
                                    if (res.confirm) {
                                        self.openSetting()
                                    }else {
                                        wx.showModal({
                                            title: '授权提示',
                                            content: '小程序需要您的微信授权才能使用哦~ 错过授权页面的处理方法：删除小程序->重新搜索进入->点击授权按钮'
                                        })
                                    }
                                }
                            })
                        }
                    })
                } else {
                    console.log('获取用户登录态失败：' + res.errMsg)
                }
            }
        })
    },

    //跳转设置页面授权
    openSetting: function () {
        if (wx.openSetting) {
            wx.openSetting({
                success: (res) => {
                    //尝试再次登录
                    this.login()
                }
            })
        } else {
            wx.showModal({
                title: '授权提示',
                content: '小程序需要您的微信授权才能使用哦~ 错过授权页面的处理方法：删除小程序->重新搜索进入->点击授权按钮'
            })
        }
    },

    //loading提示
    showLoading: function(title = '加载中', mask = true) {
        wx.showLoading({
            title: title,
            mask: mask
        })
    },

    //加载提示
    showToast: function (title = '加载中', icon = 'loading', duration = 2000 ) {
        wx.showToast({
            title: title,
            icon: icon,
            duration: duration
        })
    },

    //错误提示
    errToast: function (msg) {
        wx.showToast({
            title: msg,
            image: this.globalData.errIcon,
            duration: 3000
        })
    },

    getUserInfo: function (cb) {
        var self = this
        if (this.globalData.userInfo) {
            typeof cb == "function" && cb(this.globalData.userInfo)
        } else {
            //调用登录接口
            wx.login({
                success: () => {
                    wx.getUserInfo({
                        success: (res) => {
                            self.globalData.userInfo = res.userInfo
                            typeof cb == "function" && cb(self.globalData.userInfo)
                        }
                    })
                }
            })
        }
    },

    setUserInfo: function(userInfo) {
        if (this.globalData.userInfo){
            this.globalData.userInfo = userInfo;
            return
        }
        this.getUserInfo()
    },
    
    globalData: {
        userInfo: null,
        systemInfo: wx.getSystemInfoSync(),
        errIcon: '/images/icon/error.png',
        g_isPlaying: false,
        g_currentPlaying: null,
        toname: '',
        wishes: '',
        // in case
        // 在更多页面中选则某条祝福话后，直接覆盖上面的wishes字段,而用户却在自定义页面选择了取消或返回
        tempwishes: '',
        temptoname: '',
        tempnickname: ''
    }
})