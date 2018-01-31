let timer = null

module.exports = {
    showTopTip: function (content = '', options = {}) {
        // 如果已经有一个计时器在，就先清理掉
        if (timer) {
            clearTimeout(timer)
            timer = null
        }

        if (typeof options === 'number') {
            options = {
                duration: options
            }
        }

        // options参数默认参数扩展
        options = Object.assign({
            duration: 3000
        }, options)

        // 展示出topTips
        this.setData({
            toptip: {
                show: true,
                content,
                options
            }
        })

        // 设置定时器，定时关闭toptip
        timer = setTimeout(() => {
            this.setData({
                'toptip.show': false
            })
            timer = null
        }, options.duration)
    }
}