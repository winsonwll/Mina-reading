import api from '../../utils/api.js'
import util from '../../utils/util.js'
import {bookGenere} from '../../utils/config.js'

const app = getApp()
const { systemInfo } = app.globalData

const showLoading = app.showLoading
const showToast = app.showToast
const errToast = app.errToast

var page = [1,1,1,1,1,1,1]  //页码
var iTimer = null

Page({
    data: {
        // 小程序总是会读取data对象来做数据绑定，这个动作我们称为动作A
        // 而这个动作A的执行，是在onLoad函数执行之后发生的
        g0DataList: [],
        g1DataList: [],
        g2DataList: [],
        g3DataList: [],
        g4DataList: [],
        g5DataList: [],
        g6DataList: [],
        topTabItems: bookGenere,
        currentTopItem: '0',
        swiperHeight: systemInfo.windowHeight-37,
        scrollLeft: 0,
        total: 0,
        per_page: 4,

        searchVal: undefined,
        hotKeys: [],
        searchHistory: [],
        searchResult: [],
        containerShow: true,
        searchPanelShow: false,
        loading: false
    },

    //页面初始化 options为页面跳转所带来的参数
    //生命周期函数，监听页面加载
    onLoad: function (options) {
        this.refreshNewData()

        // 如果在onLoad方法中，不是异步的去执行一个数据绑定
        // 则不需要使用this.setData方法
        // 只需要对this.data赋值即可实现数据绑定
    },

    //生命周期函数-监听页面初次渲染完毕
    onReady: function () {
        showLoading()
        api.getHotKeys({
            success: (res) => {
                if (res.data.status === 0) {
                    this.setData({
                        hotKeys: res.data.data
                    })
                    wx.hideLoading()
                } else {
                    errToast(res.data.msg)
                }
            }
        })
    },

    //切换顶部标签
    onSwitchTab: function (ev) {
        this.setData({
            currentTopItem: ev.currentTarget.dataset.idx
        })

        //如果需要加载数据
        if (this.needLoadNewDataAfterSwiper()) {
            this.refreshNewData()
        }
    },

    //swiperChange
    onHandleChange: function (ev) {
        let iWidth = 40,
            current = ev.detail.current

        this.setData({
            currentTopItem: current,
            scrollLeft: current * iWidth
        });

        //如果需要加载数据
        if (this.needLoadNewDataAfterSwiper()) {
            this.refreshNewData()
        }
    },

    //刷新数据
    refreshNewData: function () {
        let currentTopItem = Number(this.data.currentTopItem),
            param = {
                page: page[currentTopItem],
                gid: currentTopItem
            }

        let loading = this.data.loading

        if (loading) return
        this.setData({
            loading: true
        })

        showLoading()
        api.getBookList({
            data: param,
            success: (res) => {
                if (res.data.status === 0) {
                    let data = res.data.data,
                        result = data.data

                    result.forEach((item, index) => {
                        item.created_at = item.created_at.split(' ')[0]
                    })

                    let key = `g${currentTopItem}DataList`
                    this.setData({
                        [key]: this.data[key].concat(result),
                        total: data.total,
                        per_page: data.per_page,
                        loading: false
                    })
                    wx.hideLoading()
                } else {
                    errToast(res.data.msg)
                }
            }
        })
    },

    //滚动后需不需要加载数据
    needLoadNewDataAfterSwiper: function () {
        let gid = Number(this.data.currentTopItem)
        let key = `g${gid}DataList`

        return this.data[key].length > 0 ? false : true
    },

    //加载更多操作
    loadMoreData: function () {
        let currentTopItem = this.data.currentTopItem,
            total_page = Math.ceil(this.data.total/this.data.per_page)

        let loading = this.data.loading
        if (loading) return

        if(page[currentTopItem] < total_page){
            ++page[currentTopItem]
            this.refreshNewData()
        } else {
            showToast('没有更多内容了', 'success')
            wx.stopPullDownRefresh()
        }
    },

    // 取消搜索
    onCancelTap: function () {
        this.setData({
            searchVal: '',
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
            key: 'searchHistory',
            success: (res) => {
                if (res.data) {
                    this.setData({
                        searchHistory: res.data
                    })
                }
            }
        })
    },

    // 搜索
    onSearchTap: function (ev) {
        let keyword = ev.currentTarget.dataset.keyword || util.trim(ev.detail.value),
            arrHistory = this.data.searchHistory


        if (keyword == '') return
        clearTimeout(iTimer)
        iTimer = setTimeout(() => {
            showLoading('搜索中')
            api.getSearch({
                data: {
                    keyword: keyword
                },
                success: (res) => {
                    if (res.data.status === 0) {
                        let result = res.data.data
                        if(result.length){
                            this.setData({
                                searchVal: keyword,
                                searchResult: result
                            })

                            wx.hideLoading()

                            // 更新本地存储中的搜索记录
                            arrHistory.unshift(keyword)
                            // es6 数组去重
                            arrHistory = Array.from(new Set(arrHistory))

                            wx.setStorage({
                                key: "searchHistory",
                                data: arrHistory,
                                success: () => {
                                    this.setData({
                                        searchHistory: arrHistory
                                    })
                                }
                            })
                        }else{
                            errToast('没有搜索到相关内容')
                        }
                    } else {
                        errToast(res.data.msg)
                    }
                }
            })
        }, 1e3)
    },

    // 清空搜索记录
    onRemoveSearchTap: function () {
        wx.showModal({
            title: "温馨提示",
            content: "确定清空全部搜索记录吗？该操作不可恢复哦~",
            success: (res) => {
                if (res.confirm) {
                    wx.removeStorage({
                        key: 'searchHistory',
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

    // 点击进入详情页
    onBookTap: function (ev) {
        // target 和currentTarget
        // target指的是当前点击的组件 和 currentTarget 指的是事件捕获的组件
        // target这里指的是image，而currentTarget指的是swiper

        let bookId = ev.currentTarget.dataset.bookid
        wx.navigateTo({
            url: `detail/detail?id=${bookId}`
        })
    },

    //设置该页面的分享信息
    onShareAppMessage: function () {
        return {
            title: '我为读书代言，每年一起读50本书',
            desc: '我为读书代言，每年一起读50本书',
            path: 'pages/book/book',
            success: function (res) {
                showToast('分享成功', 'success')
            },
            fail: function (err) {
                console.log('取消转发')
            }
        }
    }
})