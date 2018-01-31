module.exports = {
    showToast: function (title, timeout) {
        let toast = this.data.toast || {}
        clearTimeout(toast.timer)

        // 弹层设置
        toast = {
            show: true,
            title
        }
        this.setData({
            toast
        })

        let timer = setTimeout(() => {
            this.clearToast()
        }, timeout || 3000)

        this.setData({
            'toast.timer': timer
        })
    },

    clearToast: function () {
        let toast = this.data.toast || {}
        clearTimeout(toast.timer)

        this.setData({
            'toast.show': false
        })
    }
}