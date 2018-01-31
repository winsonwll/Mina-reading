import {CONFIG} from '../../utils/config.js'
import TopTip from '../../components/toptip/toptip.js'

const app = getApp()
const showLoading = app.showLoading
const showToast = app.showToast
const errToast = app.errToast

const poetry1 = [
        '听说好看的人手气都不差',
        '2018，你的颜值能当饭吃吗？',
        '今天靠颜值吃饭',
        '颜值越高，责任越大~',
        '这么高的颜值要承担的责任可不小哦~',
        '唉！长得太好看也是一种罪过。。。',
        '长得好看的我照镜子总被惊艳到~~',
        '距离颜值巅峰只有一步之遥~加油努力！',
        '这长相，吓死宝宝了，赶紧赔钱啊！',
        '高颜值的小哥哥，我就是觉得帅，不服的咬我啊~',
        '外貌协会专家点评：还好，能看',
        '你这么好看，咋不上天呢！',
        '花信之年',
        '何时，又在那个雨巷里，再走出一个像丁香般惆怅的姑娘',
        '丑不要紧，别出来吓人嘛',
        '这颜值在系统完全找不到对手啊~'
    ]

const poetry2 = [
        '美食当前，何必扭捏',
        '美食者不必是饕餮客',
        '美食，是人最深的乡愁',
        '美食，好酒，都不会因为你失恋了就停止供应',
        '比起享受美食，我更喜欢等待美食出炉',
        '古来圣贤皆寂寞，惟有饮者留其名',
        '世界上最治愈的东西,第一是美食',
        '人世间 酸甜苦辣 若长良川',
        '夜扫寒英煮绿尘，松风入鼎更清新',
        '唯有爱与美食不可辜负',
        '再简单的食物都有自己的灵魂',
        '无人与我立黄昏，无人问我粥可温',
        '请带冰激凌来，无论多大风雨，我去接你',
        '满堂盛宴不如与你一碗细面',
        '觚觥交错杯杯尽，门前石狮口水流',
        '油爆枇杷拌着面',
        '食不厌精，脍不厌细',
        '老夫聊发少年狂，夜食煎饺饮豆浆'
    ]

const poetry3 = [
        '蓓蕾几分苦，待到花开香满枝',
        '野花香艳无人识，孤芳自赏枉多情',
        '岁华尽摇落，芳意竟何成',
        '千万别踩疼了小草呦',
        '把美的记忆带走,把美的心灵留下',
        '人怜花似旧，花比人应瘦',
        '微雨过 小荷翻 榴花开欲燃',
        '乱红渐入迷人眼，浅草才能没马蹄',
        '暗淡轻黄体性柔，情疏迹远只香留',
        '疏影横斜水清浅，暗香浮动月黄昏',
        '比起花，我是更爱赏花人的心境',
        '暗想玉容何所似，一枝春雪冻梅花',
        '偷来梨蕊三分白，借得梅花一缕魂',
        '杏子梢头香蕾破，淡红褪白胭脂涴',
        '坐久不知香在室，推窗时见蝶飞来',
        '春日游,杏花吹满头',
        '着意闻时不肯香，香在无心处',
        '应是梨花梦好，未肯放，东风来人世'
    ]


Page(Object.assign({}, TopTip, {
    data: {
        dishBg: 'https://appvf.com/images/dish.jpg',
        searchPanelShow: false,
        btnMsg: '拍照识别',
        classify: '',
        uploadImg: '',
        poetry: [],
        searchResult: [],
        hasSearchResult: false,
        shareMsg: {},
        isFromShare: false
    },

    onLoad: function (option) {
        let classify = option.classify,
            btnMsg = '',
            shareMsg = {}

        switch(classify) {
            case 'face':
                btnMsg = '自拍测颜值'
                shareMsg.title = '测一测，看看你的颜值多少分'
                shareMsg.desc = '测一测，看看你的颜值多少分'

                wx.setNavigationBarTitle({
                  title: '颜值物语'
                })
            break;

            case 'dish':
                btnMsg = '拍照识菜'
                shareMsg.title = '这盘菜有多少卡路里？拍个照就知道'
                shareMsg.desc = '这盘菜有多少卡路里？拍个照就知道'

                wx.setNavigationBarTitle({
                  title: '菜品识别'
                })
            break;

            case 'plant':
                btnMsg = '拍照识花'
                shareMsg.title = '用一次就上瘾的识花神器'
                shareMsg.desc = '用一次就上瘾的识花神器'

                wx.setNavigationBarTitle({
                  title: '形色识花'
                })
            break;
        }

        this.setData({
            btnMsg: btnMsg,
            classify: classify,
            shareMsg: shareMsg,
            isFromShare: option.fromShare ? true : false
        })
    },

    //拍照上传
    onCamera: function() {
        let self = this

        wx.chooseImage({
          count: 1, // 默认9
          sizeType: ['original'], // 可以指定是原图还是压缩图，默认二者都有
          sourceType: ['camera'], // 可以指定来源是相册还是相机，默认二者都有
          success: function (res) {
            // 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片
            self.upload(res)
          }
        })
    },

    //相册上传
    onAlbum: function() {
        let self = this

        wx.chooseImage({
          count: 1, // 默认9
          sizeType: ['original'], // 可以指定是原图还是压缩图，默认二者都有
          sourceType: ['album'], // 可以指定来源是相册还是相机，默认二者都有
          success: function (res) {
            // 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片
            self.upload(res)
          }
        })
    },

    upload: function(res) {
        let self = this,
            classify = this.data.classify,
            poetry = []

        showLoading('努力识别中')
        
        let tempFilePaths = res.tempFilePaths[0]

        wx.uploadFile({
            url: `${CONFIG.API_URL}/recognition/${classify}`,
            filePath: tempFilePaths,
            name: 'upload',
            header: {
                "content-type": "multipart/form-data",  
                "content-type": "application/x-www-form-urlencoded"  
            },
            success: function(res){
                if(res.statusCode == 200){
                    let result = JSON.parse(res.data)

                    if(result.status === 0) {
                        let data = result.data.result,
                            hasSearchResult = false

                        /*
                            非人脸 data = []
                            人脸 data = [{}] 有值

                            非菜品 data = [{
                                calorie:"0"
                                has_calorie:true
                                name:"非菜"
                                probability:"0.999979"}]
                            菜品 data = [array(5)]
                            
                            非花 data = {name:"非植物", score:0.8272163271904}
                            花 data = [array(5)]
                        */
                        switch(classify) {
                            //人脸识别
                            case 'face':
                                if(data.length) {
                                    poetry = poetry1
                                    hasSearchResult = true
                                    
                                    data.forEach((item, index) => {
                                        let beauty = parseInt(100 - item.beauty),
                                            gender = (item.gender == 'male') ? '帅哥' : '美女',
                                            expression = '',
                                            type = '',
                                            glasses = '',
                                            race = ''

                                        switch(item.expression) {
                                            case 0:
                                                expression = '不笑'
                                            break;
                                            case 1:
                                                expression = '微笑'
                                            break;
                                            case 2:
                                                expression = '大笑'
                                            break;
                                        }

                                        item.faceshape.sort(self.compare("probability"))
                                        switch(item.faceshape[0].type) {
                                            case 'square':
                                                type = '方形'
                                            break;
                                            case 'triangle':
                                                type = '三角形'
                                            break;
                                            case 'oval':
                                                type = '椭圆形'
                                            break;
                                            case 'heart':
                                                type = '心形'
                                            break;
                                            case 'round':
                                                type = '圆形'
                                            break;
                                        }

                                        switch(item.glasses) {
                                            case 0:
                                                glasses = '无眼镜'
                                            break;
                                            case 1:
                                                glasses = '普通眼镜'
                                            break;
                                            case 2:
                                                glasses = '墨镜'
                                            break;
                                        }

                                        switch(item.race) {
                                            case 'yellow':
                                                race = '黄种人'
                                            break;
                                            case 'white':
                                                race = '白人'
                                            break;
                                            case 'black':
                                                race = '黑人'
                                            break;
                                            case 'arabs':
                                                race = '阿拉伯人'
                                            break;
                                        }


                                        item.name = `${gender}颜值：${beauty}分`
                                        
                                        item.beauty = beauty
                                        item.gender = gender
                                        item.expression = expression
                                        item.expression_probablity = (item.expression_probablity*100).toFixed(2)

                                        item.faceshape[0].type = type
                                        item.faceshape[0].probability = (item.faceshape[0].probability*100).toFixed(2)

                                        item.glasses = glasses
                                        item.glasses_probability = (item.glasses_probability*100).toFixed(2)

                                        item.race = race
                                        item.race_probability = (item.race_probability*100).toFixed(2)

                                        item.qualities.occlusion.left_eye = (item.qualities.occlusion.left_eye*100).toFixed(2)
                                        item.qualities.occlusion.right_eye = (item.qualities.occlusion.right_eye*100).toFixed(2)
                                        item.qualities.occlusion.nose = (item.qualities.occlusion.nose*100).toFixed(2)
                                        item.qualities.occlusion.mouth = (item.qualities.occlusion.mouth*100).toFixed(2)
                                        item.qualities.occlusion.left_cheek = (item.qualities.occlusion.left_cheek*100).toFixed(2)
                                        item.qualities.occlusion.right_cheek = (item.qualities.occlusion.right_cheek*100).toFixed(2)
                                        item.qualities.occlusion.chin = (item.qualities.occlusion.chin*100).toFixed(2)
                                    })
                                } else {
                                    data.push({
                                        name: '图像中没有找到人脸'
                                    })
                                }
                            break;

                            //菜品识别
                            case 'dish':
                                if(data[0].calorie !== '0') {
                                    poetry = poetry2
                                    hasSearchResult = true

                                    data.sort(self.compare("probability"))
                                    data.forEach((item, index) => {
                                        item.bowl = Math.ceil(item.calorie / 116)
                                    })
                                }
                            break;

                            //植物识别
                            case 'plant':
                                if(Array.isArray(data)) {
                                    poetry = poetry3
                                    hasSearchResult = true

                                    data.sort(self.compare("score"))
                                    data.forEach((item, index) => {
                                        item.score = (item.score*100).toFixed(2)
                                    })
                                } else {
                                    let tmp = data
                                    data = []
                                    data.push(tmp)
                                }
                            break;
                        }

                        let index = Math.floor((Math.random()*poetry.length))

                        self.setData({
                            uploadImg: tempFilePaths,
                            poetry: poetry[index],
                            searchPanelShow: true,
                            searchResult: data,
                            hasSearchResult: hasSearchResult
                        })
                    } else {
                        self.showTopTip(result.msg)
                    }
                    wx.hideLoading()
                } else {
                    wx.hideLoading()
                    self.showTopTip(res.data.msg)
                }
            },
            fail: function(err) {
                console.log(err)
            }
        })
    },

    onTopic: function() {
        this.showTopTip('敬请期待！')
    },

    compare: function (prop) {
        return function (obj1, obj2) {
            var val1 = obj1[prop];
            var val2 = obj2[prop];
            if (!isNaN(Number(val1)) && !isNaN(Number(val2))) {
                val1 = Number(val1)
                val2 = Number(val2)
            }
            if (val1 < val2) {
                return 1
            } else if (val1 > val2) {
                return -1
            } else {
                return 0
            }            
        } 
    },

    onViewMore: function() {
        wx.switchTab({
            url: '/pages/book/book'
        })
    },

    //设置该页面的分享信息
    onShareAppMessage: function () {
        return {
            title: this.data.shareMsg.title,
            desc: this.data.shareMsg.desc,
            path: `/pages/recognition/recognition?classify=${this.data.classify}&fromShare=1`,
            success: function (res) {
                showToast('分享成功', 'success')
            },
            fail: function (err) {
                console.log('取消转发')
            }
        }
    }
}))