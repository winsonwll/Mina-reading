import { setToName, clearWishes } from '../../../utils/wish.js'
import Toast from '../../../components/toast/toast.js'

const app = getApp()

Page(Object.assign({}, Toast, {
    data: {
        relation: [
            {"id": "1", "name": "长辈", "img": "elder"},
            {"id": "2", "name": "师长", "img": "teacher"},
            {"id": "3", "name": "领导", "img": "leader"},
            {"id": "4", "name": "同事", "img": "colleague"},
            {"id": "5", "name": "朋友", "img": "friend"},
            {"id": "6", "name": "恋人", "img": "lover"},
            {"id": "7", "name": "晚辈", "img": "younger"},
            {"id": "8", "name": "前任", "img": "ex"}
        ],
        gender: [
            {"id": "1", "name": "男", "img": "male"},
            {"id": "2", "name": "女", "img": "female"}
        ],
        userInfo: {},
        query: {
            relationID: 1,
            genderID: 1,
            isMore: false
        }
    },

    onLoad: function () {
        let userInfo = {}
        if (!app.globalData.userInfo) {
            //调用登录接口
            app.login()
        }
        userInfo = app.globalData.userInfo

        this.setData({
            relation1: this.data.relation.slice(0, 4),
            relation2: this.data.relation.slice(4, 8),
            userInfo: userInfo
        })
    },

    changeToName: function (ev) {
        let name = ev.detail.value
        if (name.length > 10) {
            this.showToast('称呼不超过10个字')

            this.setData({
                isMore: true
            })
        } else {
            this.setData({
                isMore: false
            })
        }

        if (!name) {
            setToName(name)
        }
    },

    //事件处理函数
    generate: function (ev) {
        clearWishes()
        let data = ev.detail.value

        if (data.toname) {
            setToName(data.toname)
        }
        wx.navigateTo({
            url: `../preview/preview?state=0&relation=${data.relationID}&sex=${data.genderID}`
        })
    },

    tap_relation: function (ev) {
        this.setData({"query.relationID": ev.currentTarget.dataset.id})
    },

    tap_gender: function (ev) {
        this.setData({"query.genderID": ev.currentTarget.dataset.id})
    }
}))