import api from '../../../utils/api.js'

const app = getApp()

const showLoading = app.showLoading
const showToast = app.showToast
const errToast = app.errToast

var page = 0,  //页码
    per_page = 20

Page({
    data: {
        list: [],
        total: 0,
        loading: false
    },

    onLoad: function (option) {
        this.setData({
            doubanId: option.doubanId
        })
        
        this.getComment()
    },

    getComment() {
        let loading = this.data.loading

        if (loading) return
        this.setData({
            loading: true
        })

        showLoading()
        api.getCommentByDoubanId({
            data: {
                page: page*per_page,
                doubanId: this.data.doubanId
            },
            success: (res) => {
                if (res.data.status === 0) {
                    let data = res.data.data,
                        result = data.comments

                    this.setData({
                        list: this.data.list.concat(result),
                        total: data.total,
                        loading: false
                    })
                    wx.hideLoading()
                } else {
                    errToast(res.data.msg)
                }
            }
        })
    },

    //加载更多操作
    loadMoreData: function () {
        let total_page = Math.ceil(this.data.total/per_page)
        
        let loading = this.data.loading
        if (loading) return

        ++page
        if(page < total_page){
            this.getComment()
        } else {
            showToast('没有更多内容了', 'success')

            setTimeout(() => {
                wx.hideLoading()
                wx.stopPullDownRefresh()
            }, 1e3)
        }
    }
})