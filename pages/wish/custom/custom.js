import Wish from '../../../utils/wish.js'

const app = getApp()

let opt
let temp = {
    toname: '',
    "best-wishes": '',
    nickName: ''
}

const saveDataToApp = function (that, ev) {
    let userInfo = that.data.userInfo
    let data = ev.detail.value
    userInfo.nickName = data.nickName

    app.setUserInfo(userInfo)
    Wish.setWishes(data['best-wishes'])
    Wish.setToName(data.toname)
}

const saveDataToAppTemp = function (that, data) {
    Wish.setTempNickName(data.nickName)
    Wish.setToName(data.toname, true)
    Wish.setWishes(data['best-wishes'], true)
}

Page({
    data: {
        isRed: false
    },

    onLoad: function (options) {
        opt = options
    },

    onShow: function () {
        app.getUserInfo((userInfo) => {
            let _userInfo = Object.assign({}, userInfo)
            _userInfo.nickName = Wish.getTempNickName() || _userInfo.nickName
            this.setData({
                userInfo: _userInfo
            })
        })

        this.setData({
            relation: opt.relation,
            sex: opt.sex,
            toname: Wish.getToName(true) || Wish.getToName(),
            wishes: Wish.getWishes(true) || Wish.getWishes()
        })
    },

    "more-template": function (ev) {
        // 防止触发more-template时,setToName,setNickName,setWishes这三个onblur事件还没有完成
        // 最好使用promise;
        setTimeout(() => {
            //防止有几条数据没有改的情况发生
            temp.toname = temp.toname || this.data.toname
            temp['best-wishes'] = temp['best-wishes'] || this.data.wishes
            temp.nickName = temp.nickName || this.data.userInfo.nickName

            saveDataToAppTemp(this, temp)
            wx.navigateTo({
                url: `../more/more?relation=${this.data.relation}&sex=${this.data.sex}`
            })
        }, 50)
    },

    save: function (ev) {
        saveDataToApp(this, ev)

        Wish.clearWishes(true)
        Wish.clearTempNickName()
        Wish.clearTempToName()
        wx.navigateBack()
    },

    setToName: function (ev) {
        temp['toname'] = ev.detail.value
    },

    setNickName: function (ev) {
        temp['nickName'] = ev.detail.value
    },

    setWishes: function (ev) {
        temp['best-wishes'] = ev.detail.value;
    },

    bindChangeText: function (ev) {
        let txt = ev.detail.value

        if (txt.length > 50) {
            this.setData({
                isRed: true
            })
        } else {
            this.setData({
                isRed: false
            })
        }
    }
})
