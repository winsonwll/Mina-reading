import util from '../../utils/util.js'

Page({
    data: {
        dateList: [],
        types: [
            {
                type: 'essay',
                name: '短 篇'
            },
            {
                type: 'serialcontent',
                name: '连 载'
            },
            {
                type: 'question',
                name: '问 答'
            }
        ],
        page: 'index',
        type: 'essay'
    },

    onLoad: function (options) {
        let page = options.page
        let dateList = util.getDateList(page)
        this.setData({
            page: page,
            dateList: dateList
        })
    },

    setType: function (ev) {
        let type = ev.target.dataset.type
        let dateList = util.getDateList(type)
        this.setData({
            dateList: dateList,
            type: type
        })
    },

    getMonthly: function (ev) {
        let month = ev.currentTarget.dataset.month
        let title = ev.currentTarget.dataset.title
        let page = this.data.page
        let type = this.data.type
        wx.navigateTo({
            url: `../${page}/monthly/monthly?type=${type}&title=${title}&month=${month}`
        })
    }
})