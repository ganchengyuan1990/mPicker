# mPicker
模仿IOS的UI写的滚动选择插件


用途：
1.时间选择，效果如图


2.地点选择，如图



使用方法：
配置option，例如下：
  option = {
			colNum: 0,				列数量
            data: [],				数据源  exp: [{ val: val, text: text, child: ['', '', ''] }]   (dataType: 1)
            dataType: 1,			数据源类型
            val: 'val',				数据源的val字段
            text: 'text',			数据源的text字段
            child: 'child',			数据源的子项字段
            multiple: false,        是否在同一页面同时加入两个模块（暂时只针对四级市问题）
            previous: [],           同时加载两个模块时，第一个模块数据（前三级市）
            funOK: {
            	btn: '',			完成按钮class
            	fun: function () {}	点击成功后的回调函数
            }
		}
