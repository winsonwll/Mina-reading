const app = getApp()
const showToast = app.showToast
const errToast = app.errToast

Page({
    data: {
        myewm: 'https://appvf.com/images/myewm.jpg',
        userInfo: {},
        showDialog: false
    },

    onLoad: function () {
        let userInfo = {}
        if (!app.globalData.userInfo) {
            //调用登录接口
            app.login()
        }
        userInfo = app.globalData.userInfo

        this.setData({
            userInfo: userInfo
        })
    },

    saveImage: function () {
        // 图片保存到本地
        wx.downloadFile({
            url: this.data.myewm,
            success: (res) => {
                wx.saveImageToPhotosAlbum({
                    filePath: res.tempFilePath,
                    success: (res) => {
                        showToast('保存成功', 'success')
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

    toggleDialog: function () {
        this.setData({
            showDialog: !this.data.showDialog
        })
    },

    //设置该页面的分享信息
    onShareAppMessage: function () {
        return {
            title: `我是${this.data.userInfo.nickName}，我为读书代言`,
            desc: '加入樊登读书会，每年一起读50本书！',
            path: '/pages/my/invite/invite',
            imageUrl: this.data.myewm,
            success: function (res) {
                showToast('分享成功', 'success')
            },
            fail: function (err) {
                console.log('取消转发')
            }
        }
    }
})