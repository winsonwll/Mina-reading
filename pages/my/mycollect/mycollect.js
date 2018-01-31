import api from '../../../utils/api.js'

const app = getApp()

const showLoading = app.showLoading

Page({
    data: {
        list: []
    },

    onLoad: function (option) {
        let books_liked = wx.getStorageSync('books_collected')
        let tmp = []

        for (let key in books_liked) {
            if(books_liked[key]){
                let k = key.substring(3)
                tmp.push(k)
            }
        }

        if(tmp.length){
            let bid = tmp.join(',')
            this.getComment(bid)
        }else{
            wx.navigateBack()
        }
    },

    getComment(bid) {
        showLoading()
        api.getMyCollect({
            query: {
                bid: bid
            },
            success: (res) => {
                if (res.data.status === 0) {
                    let data = res.data.data

                    this.setData({
                        list: data
                    })
                    wx.hideLoading()
                } else {
                    wx.navigateBack()
                }
            }
        })
    },

    // 点击进入详情页
    onBookTap: function (ev) {
        let bookId = ev.currentTarget.dataset.bookid
        wx.navigateTo({
            url: `../../book/detail/detail?id=${bookId}`
        })
    }
})