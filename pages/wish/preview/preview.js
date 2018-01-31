import { getToName, getWishes, setWishes, clearWishes, clearTempNickName, clearTempToName, request } from '../../../utils/wish.js'
import { formatToday } from '../../../utils/util.js'

const app = getApp()
let o

Page({
    data: {
        toname: '',
        relation: 1,
        sex: 1,
        today: '',
        sentday: '',
        sentence: '',
        wishesId: '',
        state: 0, //0 换一个, 1 制作我的祝福话
    },

    onLoad: function (options) {
        o = options
    },

    onShow: function () {
        let that = this

        // 进入制作页面
        if (o.state === '0') {
            clearWishes(true)
            clearTempNickName()
            clearTempToName()

            // 初始化数据
            this.setData({
                toname: getToName(),
                state: o.state,
                relation: o.relation,
                sex: o.sex,
                today: formatToday()
            })

            // 获取祝福话
            this.changeOne()

            // 获取用户信息
            app.getUserInfo((userInfo) => {
                this.setData({
                    userInfo: userInfo
                })
            })
        }

        // 接收贺卡
        if (o.state === '1') {
            this.setData({
                state: o.state,
                toname: o.toname,
                fromname: o.fromname,
                fromavatar: o.fromavatar,
                sentday: o.sentday,
                sentence: o.sentence
            })
        }

        // 判断是否需要展示 点击跳转至自定义页面的提示
        let preview_custom_hint = wx.getStorageSync('preview-custom-hint') || false
        this.setData({
            showCustomHint: preview_custom_hint
        })
    },

    finishCard: function () {
        this.setData({
            state: '1'
        })
    },

    changeOne: function (ev) {
        // 点击事件，强制拉去数据
        if (ev) {
            request({
                path: 'wishes', // 改变path名与util.request中的path名一致可以调试请求失败的情况
                relation: o.relation,
                sex: o.sex,
                id: ''
            }, (w) => {
                this.setData({
                    toname: getToName() || w.to,
                    sentence: w.wishes,
                    wishesId: w.wishes_id
                })
            })

            return
        }

        let _wishes = getWishes()
        if (_wishes) {
            this.setData({
                sentence: _wishes
            })
        } else {
            request({
                path: 'wishes', // 改变path名与util.request中的path名一致可以调试请求失败的情况
                relation: o.relation,
                sex: o.sex,
                id: ''
            }, (w) => {
                this.setData({
                    toname: getToName() || w.to,
                    sentence: w.wishes,
                    wishesId: w.wishes_id
                })
            })
        }
    },

    // 调整到制作页面
    customCard: function () {
        wx.navigateTo({
            url: `../create/create`
        })
    },

    // 跳转到自定义页面
    bindViewTap: function () {
        if (this.data.state === '0') {
            setWishes(this.data.sentence)

            wx.navigateTo({
                url: `../custom/custom?relation=${this.data.relation}&sex=${this.data.sex}`
            })
        }
    },

    confirmCustomHint: function () {
        wx.setStorageSync('preview-custom-hint', true)
        this.setData({
            showCustomHint: true
        })
    },

    //设置该页面的分享信息
    onShareAppMessage: function () {
        return {
            title: `${this.data.userInfo.nickName}给您发来祝福`,
            desc: "你也可以制作祝福话送给TA哟！",
            path: `/pages/wish/preview/preview?&state=1&fromavatar=${this.data.userInfo.avatarUrl}&toname=${this.data.toname}&fromname=${this.data.userInfo.nickName}&sentday=${this.data.today}&sentence=${this.data.sentence}`,
            success: function (res) {
                // 转发成功
                wx.showToast({
                    title: '分享成功',
                    icon: 'success'
                })
            },
            fail: function (err) {
                // 转发失败
                console.log('取消转发')
            }
        }
    }
})