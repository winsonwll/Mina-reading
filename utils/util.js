import {VOL_AND_READING_BEGIN_TIME, OTHER_BEGIN_TIME, MONTH_MAP} from './config.js'

// 去除字符串两边的空格
const trim = (str) => str.replace(/(^\s*)|(\s*$)/g, '')

// 判断Object对象是否为空
const isEmptyObject = (obj) => {
    let t
    for (t in obj)
        return !1;
    return !0
}

// 星星转换
const convertToStarsArray = (stars) => {
    let num = stars.toString().substring(0, 1)
    let arr = []
    for (let i = 1; i <= 5; i++) {
        if (i <= num) {
            arr.push(1)
        } else {
            arr.push(0)
        }
    }
    return arr
}

// 文章内容格式化
const filterContent = (str) => str.replace(/[\r\n]/g, "").replace(/<.*?>/g, "\n")

// 创作日期格式化
const formatMakettime = (dateString) => {
    return (new Date(dateString)).toString().split(' ', 4).slice(1, 4).join(' ')
}

// 日期格式化
const getBeginTime = (type) => {
    let isOther = type !== 'read' && type !== 'essay' && type !== 'index'
    let beginTime = isOther ? OTHER_BEGIN_TIME : VOL_AND_READING_BEGIN_TIME
    return new Date(beginTime)
}

const getDateList = (type) => {
    let begin = getBeginTime(type)
    let beginYear = begin.getFullYear()
    let beginMonth = begin.getMonth()

    let now = new Date()
    let nowYear = now.getFullYear()
    let nowMonth = now.getMonth()

    let dateList = []
    for (let y = nowYear; y >= beginYear; y--) {
        for (let m = 11; m >= 0; m--) {
            dateList.push({
                title: MONTH_MAP[m] + y,
                value: y + '-' + (m + 1)
            })
        }
    }

    dateList = dateList.slice(11 - nowMonth, dateList.length - beginMonth)
    return dateList
}

// 数字格式化
const formatNumber = (n) => {
    let num = n.toString()
    return num[1] ? num : `0${num}`
}

// 时间格式化
const formatTime = (date, type) => {
    let year = date.getFullYear()
    let month = date.getMonth() + 1
    let day = date.getDate()
    let hour = date.getHours()
    let minute = date.getMinutes()
    let second = date.getSeconds()
    let time = ''
    switch (type) {
        case 1:
            time = `${[year, month, day].map(formatNumber).join('.')}`
            break;
        case 2:
            time = `${[year, month, day].map(formatNumber).join('.')} ${[hour, minute].map(formatNumber).join(':')}`
            break;
        default:
            time = `${[year, month, day].map(formatNumber).join('.')} ${[hour, minute, second].map(formatNumber).join(':')}`
    }
    return time
}

const formatToday = () => {
    let date = new Date()
    let year = date.getFullYear()
    let month = formatNumber(date.getMonth() + 1)
    let day = formatNumber(date.getDate())
    return `${year}年${month}月${day}日`
}


module.exports = {
    trim,
    isEmptyObject,
    convertToStarsArray,
    filterContent,
    formatMakettime,
    getDateList,
    formatNumber,
    formatTime,
    formatToday
}