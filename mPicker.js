/*
	Author: Milk/Jason

	依赖:
		此插件依赖zepto，zepto.touch.js
		zepto CDN : http://cdn.bootcss.com/zepto/1.0rc1/zepto.min.js

	列属性:
		data-len: 		列数据项的长度
		data-index: 	当前选中项在列中的索引位置
		data-position: 	translate3d中Y轴的值，用于计算使用
	项属性:
		data-key: 		数据源的val值

	默认配置
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
*/
define('widget/mPicker', ['lib/common', 'model/area'], function($, modelArea) {
	$.fn.mPicker = function (option) {
		var $this = $(this);
		var $root = $('body');

		var defaultOption = {
			colNum: 0, //列数量
            data: [], //数据源
            dataType: 1, //数据源类型
            val: 'val', //数据源的val字段
            text: 'text', //数据源的text字段
            child: 'child', //数据源的子项字段
            multiple: false, //是否在同一页面同时加入两个模块（暂时只针对四级市问题）
            previous: [], //同时加载两个模块时，第一个模块数据（前三级市）
            buttonColor: 'blue', //按钮颜色
            funOK: {
            	btn: '',
            	fun: function () {}
            }
		};

		option = $.extend({}, defaultOption, option);

		/* 
			data: 数据源
			index: 列索引
			initVal: 初始化数据值,用','分割   exp: '1, 2, 3'
			multiple: 是否是双模块, boolean
		*/
		var bindData = function (data, index, initVal, multiple) {
			if(multiple) {
				var $cols = $('.mPicker2').find('.J_mPicker_col');
			} else {
				var $cols = $('.J_mPicker_col');
			}
			
			var $cur_col = $($cols[index]);
			var arr_key = initVal ? initVal.split(',') || [] : [];

			//数据为空直接返回
			if (!data) {
				$cur_col.attr('data-len', 0);
				$cur_col.html('');
				$cur_col.css('transform', 'translate3d(0,' + 0 + ',0)');
				$cur_col.attr('data-position', 0);
				$cur_col.attr('data-index', 0);
				return;
			}

			$cur_col.attr('data-len', data.length);

			var pickerItem = '';
			for(var i = 0, len = data.length; i < len; i++) {
				(function (item) {
					pickerItem += '<div class="tooth J_mPicker_item"' + 
							' data-key="' + (item[option.val] || (multiple ? item.name : item))  + '"' + 
							' data-code="' + (item.parentCode || '')+ '">' + 
							(item[option.text] || (multiple ? item.name : item)) + '</div>';
				})(data[i]);
			}

			$cur_col.html(pickerItem);

			//获取元素索引
			var $cur_index = 0;
			if (arr_key.length > index) {
				var $cur_item = $('div[data-key="' + arr_key[index] + '"]');
				$cur_index = $cur_item.index();
			}

			//在双模块下第二个模块必须默认选中第一个选项
			if(multiple && $cur_index < 0) $cur_index = 0;

			var positionY = -($cur_index * 2);
			$cur_col.css('transform', 'translate3d(0,' + positionY * 17.5 + 'px,0)');
			$cur_col.attr('data-position', positionY);
			$cur_col.attr('data-index', $cur_index);

			bindColEvent($cur_col);

			index++;
			if (index >= $cols.length) {
				$('.J_mPicker_col').each(function(i) {
					/*$(this).children().removeClass("selected").removeClass("selected_gap_line").removeClass("selected_gap_mutipleline");
					$(this).children().eq($(this).data('index')).addClass("selected");
					if($(this).children().eq($(this).data('index') + 1)) $(this).children().eq($(this).data('index') + 1).addClass('selected_gap_line');
					if($(this).children().eq($(this).data('index') - 1) && $(this).data('index') - 1 >= 0) $(this).children().eq($(this).data('index') - 1).addClass('selected_gap_line');
					//$(this).children().eq($(this).data('index') + 2).addClass('selected_gap_mutipleline');
					if($(this).children().eq($(this).data('index') - 2) && $(this).data('index') - 2 >= 0) $(this).children().eq($(this).data('index') - 2).addClass('selected_gap_mutipleline');*/
					neighborStyleUpdate($(this));
				});
				return;
			}
			//只有一列数据时，不需要多次绑定
			if(option.colNum > 1) {
				bindData(data[$cur_index][option.child], index, initVal);

			}
		}

		var neighborStyleUpdate = function(event) {
			event.children().removeClass("selected").removeClass("selected_gap_line").removeClass("selected_gap_mutipleline");
			event.children().eq(event.data('index')).addClass("selected");
			if(event.children().eq(event.data('index') + 1)) event.children().eq(event.data('index') + 1).addClass('selected_gap_line');
			if(event.children().eq(event.data('index') - 1) && event.data('index') - 1 >= 0) event.children().eq(event.data('index') - 1).addClass('selected_gap_line');
			if(event.children().eq(event.data('index') - 2) && event.data('index') - 2 >= 0) event.children().eq(event.data('index') - 2).addClass('selected_gap_mutipleline');
		}	

		var bindAdditionalData = function(data, index, initVal) {
			var $cols = $('.mPicker2').find('.J_mPicker_col');
			var $cur_col = $($cols[index]);
			var arr_key = initVal ? initVal.split(',') || [] : [];

			//数据为空直接返回
			if (!data) {
				$cur_col.attr('data-len', 0);
				$cur_col.html('');
				$cur_col.css('transform', 'translate3d(0,' + 0 + ',0)');
				$cur_col.attr('data-position', 0);
				$cur_col.attr('data-index', 0);
				return;
			}

			$cur_col.attr('data-len', data.length);

			var pickerItem = '';
			for(var i = 0, len = data.length; i < len; i++) {
				(function (item) {
					pickerItem += '<div class="tooth J_mPicker_item async"' + 
							' data-key="' + (item[option.val] || item.name) + '"' +
							' data-code="' + (item[option.val] || item.parentCode)+ '">' + 
							(item[option.text] || item.name) + '</div>';
				})(data[i]);
			}

			$cur_col.html(pickerItem);

			//获取元素索引
			var $cur_index = 0;
			if (arr_key.length > index) {
				//解决不同级市相同名称带来的BUG（增加$cur_col）
				var $cur_item = $cur_col.find('div[data-key="' + arr_key[index] + '"]');
				$cur_index = $cur_item.index();
			}

			var positionY = -($cur_index * 2);
			$cur_col.css('transform', 'translate3d(0,' + positionY * 17.5 + 'px,0)');
			$cur_col.attr('data-position', positionY);
			$cur_col.attr('data-index', $cur_index);

			bindColEvent($cur_col);
		}

		var bindAjaxData = function(data, index, initVal, update, loadNoData) {
			var $cols = $('.mPicker').find('.J_mPicker_col');
			var $cur_col = $($cols[index]);
			var arr_key = initVal ? initVal.split(',') || [] : [];

			//数据为空直接返回initVal
			if (!data) {
				$cur_col.attr('data-len', 0);
				$cur_col.html('');
				$cur_col.css('transform', 'translate3d(0,' + 0 + ',0)');
				$cur_col.attr('data-position', 0);
				$cur_col.attr('data-index', 0);
				return;
			}

			$cur_col.attr('data-len', data.length);

			var pickerItem = '';
			for(var i = 0, len = data.length; i < len; i++) {
				(function (item) {
					pickerItem += '<div class="tooth J_mPicker_item async"' + 
							' data-key="' + (item[option.val] || item.name) + '"' +
							' data-code="' + (item[option.val] || item.parentCode)+ '">' + 
							(item[option.text] || item.name) + '</div>';
				})(data[i]);
			}

			$cur_col.html(pickerItem);

			//获取元素索引
			var $cur_index = 0;
			if (arr_key.length > index) {
				//解决不同级市相同名称带来的BUG（增加$cur_col）
				var $cur_item = $cur_col.find('div[data-key="' + arr_key[index] + '"]');
				$cur_index = $cur_item.index();
			}

			var positionY = -($cur_index * 2);
			$cur_col.css('transform', 'translate3d(0,' + positionY * 17.5 + 'px,0)');
			$cur_col.attr('data-position', positionY);
			$cur_col.attr('data-index', $cur_index);

			bindColEvent($cur_col);

			index++;
			if (index >= $cols.length) {
				
				modelArea.getNextAddress({
	                body: {
	                    areaCode: $cur_col.children().eq($cur_index).data('code')
	                }
	            }, function(res){
	                if(res.errorCode == 0){
	                    data = res.body.address;
	                    window.additioalData = data;
	                    if(loadNoData) {
							bindAdditionalData(res.body.address, 0, initVal);
							$('.J_mPicker_previous').on('click', function () {
					            event.preventDefault();
					            $('.mPicker2').addClass("hide_it");
					            $('.mPicker').removeClass("hide_it");
					            $('.J_picker_additional').data('load', false);
					        });
						}
	                }else{
	                    $.log('获取市区信息失败');
	                }
	            });
				//默认选中样式
				$('.J_mPicker_col').each(function(i) {
					//数据抛出
					// window.additioalData = data;
					neighborStyleUpdate($(this));
					/*$(this).children().removeClass("selected").removeClass("selected_gap_line").removeClass("selected_gap_mutipleline");
					$(this).children().eq($(this).data('index')).addClass("selected");
					if($(this).children().eq($(this).data('index') + 1)) $(this).children().eq($(this).data('index') + 1).addClass('selected_gap_line');
					if($(this).children().eq($(this).data('index') - 1) && $(this).data('index') - 1 >= 0) $(this).children().eq($(this).data('index') - 1).addClass('selected_gap_line');
					//$(this).children().eq($(this).data('index') + 2).addClass('selected_gap_mutipleline');
					if($(this).children().eq($(this).data('index') - 2) && $(this).data('index') - 2 >= 0) $(this).children().eq($(this).data('index') - 2).addClass('selected_gap_mutipleline');*/
				});
				return;
			}
			
			var city;

			//暂时只针对四级市问题，因此接口是写死的
			//获取下一级的数据
			if(!update) {
				modelArea.getNextAddress({
	                body: {
	                    areaCode: data[$cur_index].parentCode
	                }
	            }, function(res){
	                if(res.errorCode == 0){
	                    city = res.body.address;
	                    bindAjaxData(city, index, initVal, undefined, loadNoData);
	                }else{
	                    $.log('获取市区信息失败');
	                }

	            });
			}
		}

		//列滚动事件绑定
		var bindColEvent = function ($cur_col) {
			$cur_col.off('touchstart').on('touchstart', function (event) {
				event.preventDefault();

				var target = event.target;
				//把target定为'.J_mPicker_col'
				while (true) {
					if (!target.classList.contains('J_mPicker_col')) {
						target = target.parentElement;
					}
					else {
						break;
					}
				}
				target['oldScreen'] = event.targetTouches[0].screenY;
				var old_position = $(target).data('position');
				if (old_position) {
					target['old_position'] = parseFloat(old_position);
				}
				else {
					target['old_position'] = 0;
				}
			})

			$cur_col.off('touchmove').on('touchmove', function (event) {
				event.preventDefault();

				var target = event.target;
				while (true) {
					if (!target.classList.contains('J_mPicker_col')) {
						target = target.parentElement;
					}
					else {
						break;
					}
				}

				target['newScreen'] = event.targetTouches[0].screenY;
				//计算滚动了多少项 转化为rem
				var scrollItemsNum = (target['newScreen'] - target['oldScreen']) / $(window).height() * 35;
				var new_position = target['old_position'] + scrollItemsNum;

				$(target).css('transform', 'translate3d(0,' + new_position * 17.5 + 'px,0)');
				$(target).attr('data-position', new_position);
			})

			$cur_col.off('touchend').on('touchend', function (event) {
				event.preventDefault();

				var target = event.target;

				//选中的样式文字加粗
				/*$(target).addClass('selected');*/
				while (true) {
					if (!target.classList.contains('J_mPicker_col')) {
						target = target.parentElement;
					}
					else {
						break;
					}
				}

				//矫正选择过后的位置
				var correctPosition = function (position) {
					var num = parseInt(position);
					
					//最大高度
					if (position > 0) {
						return 0;
					}

					//最小高度
					var minPosition = 0;
					minPosition = ($(target).data('len') - 1) * -1 * 2;
					if (position < minPosition) {
						return minPosition;
					}

					if (num % 2) {
						position = Math.ceil(position) - 1;
					}
					else {
						position = num;
					}
					return position;
				}

				//更新数据
				var updateData = function (target, async) {
					var $cols = $('.J_mPicker_col');
					var $cur_col_index = $(target).parent().index();//当前第几列
					var $index = $(target).data('index');//第几条数据

					//递归获取当先列下一列的数据
					var i = 0;//计数器

					if(async) {
						var getChildData = function (data, nextFirst) {
							if (i + $cur_col_index < 2) {
								var $col = $($cols[i]);
								i++;
								var param = nextFirst ? nextFirst.parentCode : $(target).find('.J_mPicker_item').eq($index).data('code')
								modelArea.getNextAddress({
					                body: {
					                    areaCode: param
					                }
					            }, function(res){
					                if(res.errorCode == 0){
					                    data = res.body.address;
					                    bindAjaxData(data, ($cur_col_index == i) ? ($cur_col_index + 1) : i, '', true);
					                    var targetDoms = $('.J_mPicker_col').eq(i).children();
					                    updateDataAsync(targetDoms, i);
					                    /*var targetIndex = $('.J_mPicker_col').eq(i).data('index');
					                    targetDoms.removeClass("selected").removeClass('selected_gap_line').removeClass('selected_gap_mutipleline');
					                    targetDoms.eq($('.J_mPicker_col').eq(i).data('index')).addClass('selected');
					                    if (targetDoms.eq($('.J_mPicker_col').eq(i).data('index') + 1)) targetDoms.eq($('.J_mPicker_col').eq(i).data('index') + 1).addClass('selected_gap_line');
					                    if (targetIndex - 1 >= 0 && targetDoms.eq($('.J_mPicker_col').eq(i).data('index') - 1)) targetDoms.eq($('.J_mPicker_col').eq(i).data('index') - 1).addClass('selected_gap_line');targetDoms.eq($('.J_mPicker_col').eq(i).data('index') - 1).addClass('selected_gap_line');
					                    //targetDoms.eq($('.J_mPicker_col').eq(i).data('index') + 2).addClass('selected_gap_mutipleline');
					                    if (targetIndex - 2 >= 0 && targetDoms.eq($('.J_mPicker_col').eq(i).data('index') - 2)) targetDoms.eq($('.J_mPicker_col').eq(i).data('index') - 2).addClass('selected_gap_mutipleline');*/
					                    return getChildData(data, data[0]);
					                }else{
					                    $.log('获取市区信息失败');
					                }
					            });
								
							}
							else if(i + $cur_col_index == 2){
								var param = nextFirst ? nextFirst.parentCode : $(target).find('.J_mPicker_item').eq($index).data('code')
								modelArea.getNextAddress({
					                body: {
					                    areaCode: param
					                }
					            }, function(res){
					                if(res.errorCode == 0){
					                    data = res.body.address;
					                    window.additioalData = data;
					                    var targetDoms = $('.J_mPicker_col').eq(2).children();
					                    updateDataAsync(targetDoms, 2);
					                    /*var targetIndex = $('.J_mPicker_col').eq(2).data('index');
					                    targetDoms.removeClass("selected").removeClass('selected_gap_line').removeClass('selected_gap_mutipleline');
					                    targetDoms.eq($('.J_mPicker_col').eq(2).data('index')).addClass('selected');
					                    if(targetDoms.eq($('.J_mPicker_col').eq(2).data('index') + 1)) targetDoms.eq($('.J_mPicker_col').eq(2).data('index') + 1).addClass('selected_gap_line');
					                    if(targetIndex - 1 >= 0 && targetDoms.eq($('.J_mPicker_col').eq(2).data('index') - 1)) targetDoms.eq($('.J_mPicker_col').eq(2).data('index') - 1).addClass('selected_gap_line');
					                    //targetDoms.eq($('.J_mPicker_col').eq(2).data('index') + 2).addClass('selected_gap_mutipleline');
					                    if(targetIndex - 2 >= 0 && targetDoms.eq($('.J_mPicker_col').eq(2).data('index') - 2)) targetDoms.eq($('.J_mPicker_col').eq(2).data('index') - 2).addClass('selected_gap_mutipleline');*/
					                }else{
					                    $.log('获取市区信息失败');
					                }
					            });
							}						
						}

						// var data = getChildData(option.data);
					} else {
						var getChildData = function (data) {
							if (i <= $cur_col_index) {
								var $col = $($cols[i]);
								i++;
								return getChildData(data[$col.data('index')][option.child]);
							}
							else {
								return data;
							}
						}

						// var data = getChildData(option.data);

						// bindData(data, $cur_col_index + 1);
					}
					var data = getChildData(option.data);

					if (option.dataType == 1 && $('.mPicker').length == 1 && !option.multiple) {
						bindData(data, $cur_col_index + 1);
					}
				}

				var new_position = $(target).data('position');
				var correct_position = correctPosition(new_position);
				$(target).css('transform', 'translate3d(0,' + correct_position * 17.5 + 'px,20px)');
				$(target).attr('data-position', correct_position);
				
				var selectedNum = Math.abs(correct_position) / 2;
				$(target).children().removeClass('selected').removeClass('selected_gap_line').removeClass('selected_gap_mutipleline');
				$(target).attr('data-index', selectedNum);
				$(target).children().eq(selectedNum).addClass('selected');
				$(target).children().eq(selectedNum + 1).addClass('selected_gap_line');
				if(selectedNum - 1 >= 0) $(target).children().eq(selectedNum - 1).addClass('selected_gap_line');
				$(target).children().eq(selectedNum + 2).addClass('selected_gap_mutipleline');
				if(selectedNum - 2 >= 0) $(target).children().eq(selectedNum - 2).addClass('selected_gap_mutipleline');
				//$('.mPicker_roll_mask').removeClass("hide_it");
				updateData(target, $(event.target).hasClass('async'));
			})
		}

		var updateDataAsync = function(targetDoms, index) {
			var targetIndex = $('.J_mPicker_col').eq(index).data('index');
            targetDoms.removeClass("selected").removeClass('selected_gap_line').removeClass('selected_gap_mutipleline');
            targetDoms.eq($('.J_mPicker_col').eq(index).data('index')).addClass('selected');
            if(targetDoms.eq($('.J_mPicker_col').eq(index).data('index') + 1)) targetDoms.eq($('.J_mPicker_col').eq(index).data('index') + 1).addClass('selected_gap_line');
            if(targetIndex - 1 >= 0 && targetDoms.eq($('.J_mPicker_col').eq(index).data('index') - 1)) targetDoms.eq($('.J_mPicker_col').eq(index).data('index') - 1).addClass('selected_gap_line');
            //targetDoms.eq($('.J_mPicker_col').eq(2).data('index') + 2).addClass('selected_gap_mutipleline');
            if(targetIndex - 2 >= 0 && targetDoms.eq($('.J_mPicker_col').eq(index).data('index') - 2)) targetDoms.eq($('.J_mPicker_col').eq(index).data('index') - 2).addClass('selected_gap_mutipleline');
		}

		var initPicker = function (loadNoData) {
			switch (option.dataType) {
				case 1: 
					bindData(option.data, 0, $this.data('key'), option.multiple);
					break;
				case 2:
					//异步请求列数据，针对四级市问题
					bindAjaxData(option.data, 0, $this.data('key'), undefined ,loadNoData);
					break;

			}
		}

		//关闭弹窗，只是隐去不删除
		var close = function () {
			// $('.J_mPicker').remove();
			$('.J_mPicker').addClass("hide_it");
			$('body').css('overflow', 'scroll');
		}

		//生成html，注意如果是生成亮哥模板，再需要区分buttonName，否则监听事件会有重合
		var createHtml = function (button1, button2, multiple, updatePrevious, columnNum, buttonName) {
			//如果是updatePrevious, 那么只需要更新节点
			if(!updatePrevious) {
				var arr_html = [];
				arr_html.push('<div class="mPicker' + (multiple ? 2 : '') + ' J_mPicker hide_it">');
				arr_html.push('<div class="mPicker_ctrl slideInUp">');

				arr_html.push('<div class="mPicker_btn_box">');

				if(multiple) {
					arr_html.push('<div class="mPicker_btn J_mPicker_previous">'+ button1 + '</div>');
				} else {
					arr_html.push('<div class="mPicker_btn J_mPicker_cancel">'+ (button1 ? button1 : '取消')  + '</div>');
				}
				
				if(option.previous.length > 0) {
					arr_html.push('<p class="mention">'+ option.previous.join('>') + '</p>');
				}
				arr_html.push('<div class="mPicker_btn ' + (buttonName ? buttonName: option.funOK.btn) + '">' + (button2 ? button2 : '确定') + '</div>');
				arr_html.push('</div>');

				arr_html.push('<div class="mPicker_roll_mask">');
				arr_html.push('<div class="mPicker_roll">');
				if(columnNum) option.colNum = columnNum;
				for (var i = 0, len = option.colNum; i < len; i++) {
					arr_html.push('<div><div class="gear J_mPicker_col"></div><div class="mPicker_grid"></div></div>');
				}
				arr_html.push('</div>');
				arr_html.push('</div>');

				arr_html.push('</div>');
				arr_html.push('</div>');

				return arr_html.join('');

			} else {
				$('.mPicker2').find('.mention').html(option.previous.join('>'));
			}

			/*$root.on('click', '.outbox', function() {
				alert(333);
				if($('.mPicker').length > 1) {
					$('.mPicker').addClass("hide_it");
				}
			});*/
			
		}

		//事件处理
		$('input.mPickerInput').off('tap').on('tap', function (event) {
			dealWithPicker($(event.target).hasClass('multip'), $(event.target).data('load'));
			$('body').css('overflow', 'hidden');
			initPicker($(event.target).data('load'));
		});

		//区分四级市问题和其他简单应用场景
		var dealWithPicker = function(multiple, loadNoData) {
			if(multiple) {
				if(loadNoData) {
					if($('.mPicker').length == 0) $('body').append(createHtml());
					if($('.mPicker2').length == 0)  $('body').append(createHtml("上一步","确定", true, undefined, 1, "J_setAdditionalLocation"));
					$('.mPicker2').removeClass("hide_it");
					$('.mPicker').removeClass("hide_it");
				} else {
					if($('.mPicker2').length == 0) {
						$('body').append(createHtml("上一步","确定", true));
					} else {
						$('body').append(createHtml("上一步","确定", true, true));
					}
				}
				$('.mPicker2').removeClass("hide_it");
				$('.J_mPicker_previous').off('click').on('click', function () {
		            event.preventDefault();
		            $('.J_mPicker').toggleClass("hide_it");
		        });
			} else {
				if($('.mPicker').length == 0) {
					$('body').append(createHtml());
				}
				$('.mPicker').removeClass("hide_it");

			}
		}

		var certainTouchend = function(event) {
			event.preventDefault();
			if($(event.target).hasClass('J_setAdditionalLocation') || $('.J_picker_additional').data('load')) {
				var $cols = $('.J_mPicker_col');
			} else {
				var $cols = $('.mPicker').find('.J_mPicker_col');
			}
			 
			var final_val = '';
			var final_txt = '';
			var codeArr = [];

			for (var i = 0, len = $cols.length; i < len; i++) {
				var $cur_index = $($cols[i]).data('index');
				var $cur_item = $($($cols[i]).children()[$cur_index]);
				var $val = $cur_item.data('key');
				var $txt = $cur_item.html();
				var $code = $cur_item.data('code');

				final_val += ($val + ',');
				final_txt += ($txt + ',');
				codeArr.push($code);
			}

			final_val = final_val.substring(0, final_val.length - 1);
			final_txt = final_txt.substring(0, final_txt.length - 1);

			$this.attr('data-key', final_val);
			$this.val(final_txt);

			close();

			var targetMDom = event.target.closest('.J_mPicker');
			//抛出window下的变量、四级市地址code以及目标DOM供页面使用，可优化
			option.funOK.fun($this, final_val, final_txt, window.additioalData, codeArr[$cols.length - 1], targetMDom);
		}

		//使用 touchend + event.preventDefault() 防止tap点透
		$root.on('touchend', '.J_mPicker_cancel', function () {
			event.preventDefault();
			close();
		});

		$('.J_mPicker').on('click', function() {
            if($('.mPicker').length > 1) {
                $('.mPicker').addClass("hide_it");
            }
		})

		$('.J_setAdditionalLocation').off('touchend').on('touchend', function (event) {
			certainTouchend(event);
		});

		$root.on('touchend', '.' + option.funOK.btn, function (event) {
			certainTouchend(event);
		})
	}
})