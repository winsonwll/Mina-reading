import {setWishes, request} from '../../../utils/wish.js'

const app = getApp()

Page({
    data: {
        checkedID: null
    },

    onLoad: function (opt) {
        app.getUserInfo(function (userInfo) {
            console.log(userInfo.nickName)
        })

        request({
            path: 'lists',
            relation: opt.relation,
            sex: opt.sex
        }, (wishList) => {
            this.setData({
                wishList: wishList
            })
        })
    },

    check: function (ev) {
        let id = ev.currentTarget.dataset.id
        if (this.data.checkedID !== id) {
            this.setData({
                checkedID: id
            })
        }
    },

    save: function () {
        let id = this.data.checkedID
        let wishList = this.data.wishList

        let i = wishList.findIndex(function (item, index, arr) {
            return item.id == id
        })

        if (i >= 0) {
            setWishes(wishList[i].wishes, true)
            wx.navigateBack()
        } else {
            console.error(`no item with id ${id} in wishList`)
        }
    }
})
