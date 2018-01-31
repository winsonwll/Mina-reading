import api from '../../utils/api.js'
import util from '../../utils/util.js'

const app = getApp()

const showLoading = app.showLoading
const showToast = app.showToast
const errToast = app.errToast

var iTimer = null

Page({
    data: {
        tripList: [],
        next_start: 0,
        loading: false,

        searchVal: undefined,
        start: 0,
        hotKeys: [],
        searchHistory: [],
        searchResult: [],
        containerShow: true,
        searchPanelShow: false,
    },

    onLoad: function () {
        this.loadMoreData()
    },

    onReady: function () {
        this.setData({
            hotKeys: ['泰国', '滑雪', '三亚', '厦门', '马尔代夫', '温泉', '北海道', '迪士尼', '欧洲', '亲子游', '带着天使旅行', '北极']
        })
    },

    loadMoreData: function () {
        let loading = this.data.loading
        let data = {
            next_start: this.data.next_start
        }

        if (loading) return
        this.setData({
            loading: true
        })

        showLoading()
        api.getHotTripList({
            data,
            success: (res) => {
                let newList = res.data.data.elements,
                    nextStart = res.data.data.next_start

                if(newList.length) {
                    newList.map((item) => {
                        item.data[0].date_added = util.formatTime(new Date(item.data[0].date_added * 1000), 1)
                        return item
                    })

                    //es6合并数组
                    newList = [...this.data.tripList, ...newList]

                    this.setData({
                        tripList: newList,
                        next_start: nextStart,
                        loading: false
                    })

                    wx.hideLoading()
                } else {
                    showToast('没有更多内容了', 'success')
                    wx.stopPullDownRefresh()
                }
            }
        })
    },

    onViewTripTap: function (ev) {
        let id = ev.currentTarget.dataset.id
        wx.navigateTo({
            url: `detail/detail?id=${id}`
        })
    },


    // 取消搜索
    onCancelTap: function () {
        this.setData({
            searchVal: '',
            start: 0,
            containerShow: true,
            searchPanelShow: false,
            searchResult: []
        })
    },

    // 聚焦搜索框
    onBindFocus: function () {
        this.setData({
            containerShow: false,
            searchPanelShow: true
        })

        // 获取缓存中的搜索记录
        wx.getStorage({
            key: 'searchTripHistory',
            success: (res) => {
                if (res.data) {
                    this.setData({
                        searchHistory: res.data
                    })
                }
            }
        })
    },

    // 实时搜索
    onSearchActiveTap: function (ev) {
        let key = util.trim(ev.detail.value)
        if (key == '') return

        clearTimeout(iTimer)
        iTimer = setTimeout(() => {
            this.setData({
                searchVal: key,
                start: 0,
                searchResult: []
            })

            this.loadMoreSearchData()
        }, 1e3)
    },

    // 搜索
    onSearchTap: function (ev) {
        let key = ev.currentTarget.dataset.keyword || util.trim(ev.detail.value)
        if (key == '') return

        this.setData({
            searchVal: key
        })

        this.loadMoreSearchData()
    },

    loadMoreSearchData: function () {
        let loading = this.data.loading,
            key = this.data.searchVal

        let data = {
            key: key,
            start: this.data.start*5
        }

        if (loading) return
        this.setData({
            loading: true
        })

        let arrHistory = this.data.searchHistory

        showLoading('搜索中')
        api.getSearchTrip({
            data,
            success: (res) => {
                let newList = res.data.data.trips,
                    start = ++this.data.start

                if(newList.length) {
                    newList.map((item) => {
                        item.date_added = util.formatTime(new Date(item.date_added * 1000), 1)
                        return item
                    })

                    //es6合并数组
                    newList = [...this.data.searchResult, ...newList]

                    this.setData({
                        searchResult: newList,
                        start: start,
                        loading: false
                    })

                    wx.hideLoading()

                    // 更新本地存储中的搜索记录
                    arrHistory.unshift(key)
                    // es6 数组去重
                    arrHistory = Array.from(new Set(arrHistory))

                    wx.setStorage({
                        key: "searchTripHistory",
                        data: arrHistory,
                        success: () => {
                            this.setData({
                                searchHistory: arrHistory
                            })
                        }
                    })
                } else {
                    showToast('没有更多内容了', 'success')
                }
            }
        })
    },


    // 清空搜索记录
    onRemoveSearchTap: function () {
        wx.showModal({
            title: "温馨提示",
            content: "确定清空全部搜索记录吗？该操作不可恢复哦~",
            success: (res) => {
                if (res.confirm) {
                    wx.removeStorage({
                        key: 'searchTripHistory',
                        success: () => {
                            this.setData({
                                searchVal: '',
                                searchHistory: []
                            })
                        }
                    })
                }
            }
        })
    },

    //设置该页面的分享信息
    onShareAppMessage: function () {
        return {
            title: '每一篇游记都能激发你强烈的旅行冲动',
            desc: '涵盖世界各国的异域风景和不同文化的旅行指南',
            path: 'pages/trip/trip',
            success: function (res) {
                showToast('分享成功', 'success')
            },
            fail: function (err) {
                console.log('取消转发')
            }
        }
    }
})
