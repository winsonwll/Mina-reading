import Toast from '../../components/toast/toast.js'
import TopTip from '../../components/toptip/toptip.js'

// 获取应用实例
const app = getApp()
const showToast = app.showToast
const errToast = app.errToast

Page(Object.assign({}, Toast, TopTip, {
    data: {
        userInfo: {},
        showDialog: false,
        hasCollected: false,
        hasLiked: false,
    },

    onLoad: function () {
        //收藏状态
        let booksCollected = wx.getStorageSync('books_collected')
        let btn1 = Object.values(booksCollected).some((item, index) => {
            return item === true
        })

        //点赞状态
        let booksLiked = wx.getStorageSync('books_liked')
        let btn2 = Object.values(booksLiked).some((item, index) => {
            return item === true
        })

        let userInfo = wx.getStorageSync('userInfo')
        if (!userInfo) {
            //调用登录接口
            app.login()
        }

        // 更新数据
        this.setData({
            userInfo: userInfo,
            hasCollected: btn1,
            hasLiked: btn2
        })
    },

    onInviteTap: function () {
        wx.navigateTo({
            url: 'invite/invite'
        })
    },

    onCollect: function () {
        if(this.data.hasCollected){
            wx.navigateTo({
                url: 'mycollect/mycollect'
            })
        }else{
            this.onShowTopTipTap('暂无收藏')
        }
    },

    onLike: function () {
        if(this.data.hasLiked){
            wx.navigateTo({
                url: 'mylike/mylike'
            })
        }else{
            this.onShowToastTap('暂无点赞')
        }
    },

    onLogoutTap: function () {
        wx.showModal({
            title: '温馨提示',
            content: '确定要退出登录吗？',
            success: function (res) {
                if (res.confirm) {
                    wx.removeStorageSync('sessionId')
                } else if (res.cancel) {
                    console.log('用户点击取消')
                }
            }
        })
    },

    onShowTopTipTap: function (tips) {
        this.showTopTip(tips)
    },

    onShowToastTap: function (tips) {
        this.showToast(tips)
    },

    onFaceTap: function() {
        wx.navigateTo({
            url: '/pages/recognition/recognition?classify=face'
        })
    },

    onDishTap: function () {
        wx.navigateTo({
            url: '/pages/recognition/recognition?classify=dish'
        })
    },

    onPlantTap: function () {
        wx.navigateTo({
            url: '/pages/recognition/recognition?classify=plant'
        })
    },

    onWishTap: function () {
        wx.navigateTo({
            url: '/pages/wish/create/create'
        })
    },

    onWeatherTap: function () {
        wx.navigateTo({
            url: 'weather/weather'
        })
    },

    toggleDialog: function () {
        this.setData({
            showDialog: !this.data.showDialog
        })
    }
}))
