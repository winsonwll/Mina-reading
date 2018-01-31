import {CONFIG} from '../../../utils/config.js'

const app = getApp()

const showLoading = app.showLoading
const errToast = app.errToast

Page({
    data: {
        weatherBg: 'https://appvf.com/images/weather.jpg',
        weather: {}
    },

    onLoad: function () {
        this.loadWeatherData((data) => {
            this.setData({
                weather: data
            })

            // 更新城市名称
            wx.setNavigationBarTitle({
                title: data.city + ' 天气预报'
            })
        })
    },

    // 获取当前的地理位置经纬度
    getLocation: function (callback) {
        wx.getLocation({
            success: (res) => {
                callback(true, res.latitude, res.longitude)
            },
            fail: () => {
                callback(false)
            }
        })
    },

    // 根据经纬度获取城市名称
    getCityName: function (latitude, longitude, callback) {
        //var apiURL = "https://api.map.baidu.com/geocoder/v2/?ak=tr44ulLmCKfj51tm9LViW1BYGo14mDp3&location='+latitude+','+longitude+'&output=json";

        // 根据ip获取城市名称
        let apiURL = `${CONFIG.API_URL}/baidu_location`
        wx.request({
            url: apiURL,
            success: (res) => {
                callback(res.data["content"]["address_detail"]["city"])
            }
        })
    },

    // 根据darksky.net接口获取天气信息
    getWeatherByLocation: function (latitude, longitude, callback) {
        let apiURL = `${CONFIG.API_URL}/darksky_forecast/${latitude}/${longitude}`

        showLoading()
        wx.request({
            url: apiURL,
            success: (res) => {
                let weatherData = this.parseWeatherData(res.data)

                this.getCityName(latitude, longitude, function(city){
                    weatherData.city = city
                    callback(weatherData)
                })
                wx.hideLoading()
            },
            fail: (err) => {
                errToast('获取天气信息失败')
            }
        });
    },

    // 取得我们需要的数据并重组成新的结果
    parseWeatherData: function (data) {
        let weather = {}
        weather.current = data.currently
        weather.daily = data.daily
        return weather
    },

    // 加载天气数据
    requestWeatherData: function (cb) {
        this.getLocation((success, latitude, longitude) => {
            //如果 GPS 信息获取不成功，设置一个默认坐标
            if(success == false) {
                latitude = 0
                longitude = 0
            }

            //请求天气数据 API
            this.getWeatherByLocation(latitude, longitude, function(weatherData){
                cb(weatherData)
            })
        })
    },

    loadWeatherData: function (callback) {
        this.requestWeatherData((data) => {
            // 对原始数据做一些修整，然后输出给前端
            let weatherData = {}
            weatherData = data
            weatherData.current.formattedDate = this.formatDate(data.current.time)
            weatherData.current.formattedTime = this.formatTime(data.current.time)
            weatherData.current.temperature = parseInt(weatherData.current.temperature) + '℃'

            let wantedDaily = []
            for(var i = 1;i < weatherData.daily.data.length; i++) {
                let wantedDailyItem = weatherData.daily.data[i]
                let time = weatherData.daily.data[i].time
                wantedDailyItem["weekday"] = this.formatWeekday(time)
                wantedDailyItem["temperatureMin"] = parseInt(weatherData.daily.data[i]["temperatureMin"]) + '℃'
                wantedDailyItem["temperatureMax"] = parseInt(weatherData.daily.data[i]["temperatureMax"]) + '℃'

                wantedDaily.push(wantedDailyItem)
            }

            weatherData.daily.data = wantedDaily
            callback(weatherData)
        })
    },

    // 将时间戳格式化为日期
    formatDate: function (timestamp) {
        let date = new Date(timestamp * 1000)
        return date.getMonth()+1 + "月" + date.getDate() + "日 " + this.formatWeekday(timestamp)
    },

    // 将时间戳格式化为时间
    formatTime: function (timestamp) {
        let date = new Date(timestamp * 1000)
        return date.getHours() + ":" + date.getMinutes()
    },

    // 中文形式的每周日期
    formatWeekday: function (timestamp) {
        var date = new Date(timestamp * 1000)
        var weekday = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"]
        var index = date.getDay()
        return weekday[index]
    }
})