import {CONFIG} from './config.js'

// ONE APP 阅读和音乐数据api 面包旅行APP 游记数据api
const {API_URL} = CONFIG

// 获取应用实例
const app = getApp()

// 网络请求
const wxRequest = (params, url) => {
    // 检查网络状态
    wx.getNetworkType({
        success: function (res) {
            if (res.errMsg !== 'getNetworkType:ok') {
                wx.showModal({
                    content: '获取网络状态失败'
                })
                return false
            }
            if (res.networkType === 'none') {
                wx.showModal({
                    content: '当前网络不可用，请检查网络设置'
                })
                return false
            }
        }
    })

    wx.request({
        url: url,
        method: params.method || 'GET',
        data: params.data || {},
        header: {'Content-Type': 'application/json'},
        success: (res) => {
            params.success && params.success(res) && wx.hideToast()
        },
        fail: (err) => {
            wx.showToast({
                title: err.errMsg,
                image: '/images/icon/error.png'
            })
            // params.fail && params.fail(res)
        },
        complete: (res) => {
            params.complete && params.complete(res)
        }
    })
}

// 登录接口请求
const getLogin = (params) => wxRequest(params, `${API_URL}/login`)

// 图书接口请求数据
const getBookList = (params) => wxRequest(params, `${API_URL}/getBooks`)
const getHotKeys = (params) => wxRequest(params, `${API_URL}/getHotKeys`)
const getSearch = (params) => wxRequest(params, `${API_URL}/getSearch`)
const getBookById = (params) => wxRequest(params, `${API_URL}/getBook/${params.query.id}`)
const getCommentByDoubanId = (params) => wxRequest(params, `${API_URL}/getComment`)

const getMyLike = (params) => wxRequest(params, `${API_URL}/like/${params.query.bid}`)
const getMyCollect = (params) => wxRequest(params, `${API_URL}/collect/${params.query.bid}`)

// 阅读接口请求数据
const getCarousel = (params) => wxRequest(params, `${API_URL}/api/reading/carousel`)
const getLastArticles = (params) => wxRequest(params, `${API_URL}/api/reading/index`)
const getEssayById = (params) => wxRequest(params, `${API_URL}/api/essay/${params.query.id}`)
const getSerialById = (params) => wxRequest(params, `${API_URL}/api/serialcontent/${params.query.id}`)
const getQuestionById = (params) => wxRequest(params, `${API_URL}/api/question/${params.query.id}`)
const getArticlesByMonth = (params) => wxRequest(params, `${API_URL}/api/${params.query.type}/bymonth/${params.query.month}`)

// 音乐接口请求数据
const getMusicIdList = (params) => wxRequest(params, `${API_URL}/api/music/idlist/0`)
const getMusicsByMonth = (params) => wxRequest(params, `${API_URL}/api/music/bymonth/${params.query.month}`)
const getMusicDetailById = (params) => wxRequest(params, `${API_URL}/api/music/detail/${params.query.id}`)

// 游记接口请求数据
const getHotTripList = (params) => wxRequest(params, `${API_URL}/v2/index/`)
const getTripInfoByID = (params) => wxRequest(params, `${API_URL}/trips/${params.query.id}/waypoints/`)
const getWaypointInfoByID = (params) => wxRequest(params, `${API_URL}/trips/${params.query.tripId}/waypoints/${params.query.waypointId}/`)
const getWaypointReplyByID = (params) => wxRequest(params, `${API_URL}/trips/${params.query.tripId}/waypoints/${params.query.waypointId}/replies/`)
const getUserInfoByID = (params) => wxRequest(params, `${API_URL}/users/${params.query.userId}/v2`)
const getSearchTrip = (params) => wxRequest(params, `${API_URL}/v2/search/`)

// 分享朋友圈接口请求数据
const getShareTimeline = (params) => wxRequest(params, `${API_URL}/share_timeline`)

module.exports = {
    getLogin,
    getBookList,
    getHotKeys,
    getSearch,
    getBookById,
    getCommentByDoubanId,
    getMyLike,
    getMyCollect,
    getCarousel,
    getLastArticles,
    getEssayById,
    getSerialById,
    getQuestionById,
    getArticlesByMonth,
    getMusicIdList,
    getMusicsByMonth,
    getMusicDetailById,
    getHotTripList,
    getTripInfoByID,
    getWaypointInfoByID,
    getWaypointReplyByID,
    getUserInfoByID,
    getSearchTrip,
    getShareTimeline
}