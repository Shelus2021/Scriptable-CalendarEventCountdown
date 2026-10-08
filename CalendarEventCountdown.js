// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: deep-gray; icon-glyph: magic;
// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: gray; icon-glyph: magic;
// 作者：Shelus2021
// Copyright © Shelus2021.
// Licensed under the PolyForm Noncommercial License 1.0.0.
// Noncommercial use, modification, and redistribution are permitted with attribution.
// License: https://polyformproject.org/licenses/noncommercial/1.0.0
// Required Notice: Copyright © Shelus2021. Original work: Calendar Event Countdown.
// 支持iOS所有规格小组件，尽情使用。
// 参数：一个日历名称、或者多个日历名称用/隔开、或者一个事件标题、或者一个事件标题的一部分
// 参数之间用.隔开
// 锁屏小组件支持最多两个参数
// 桌面小组件支持三种界面，输入$month为日历、输入$today为今日、输入参数为倒数日（支持最多五个参数）

// 是否周一起始
const weekStartsMonday = true;
// 是否隐藏非本月
const hideOtherMonth = false;
// 是否显示休班特性
const showRestFeature = true;
// 是否隐藏休班事件
const hideRestEvent = true;
// 休班日历名称及事件判断包含内容
const restCalendarTitle = "中国大陆节假日" 
const restEventTitle = "（休）"
const workEventTitle = "（班）"
// 界面语言："auto" 跟随系统，也可填写 "zh" 或 "en"
const languageMode = "auto";
// 月历标题右侧的自定义文字
const monthSubtitle = {
	zh: "美好即将发生",
	en: "Good things ahead"
};

const translations = {
	zh: {
		inputError: "输入有误或事件为空",
		checkParameters: "请检查参数是否符合要求",
		countdown: "倒数日",
		unsupported: "暂不支持该组件",
		now: "此刻",
		today: "今天",
		yesterday: "昨天",
		dayBeforeYesterday: "前天",
		tomorrow: "明天",
		dayAfterTomorrow: "后天",
		daysAgo: days => days + "天前",
		daysLater: days => days + "天后",
		startTime: "开始时间",
		endTime: "结束时间",
		weekdays: ["日", "一", "二", "三", "四", "五", "六"],
		weekdayNames: ["日", "一", "二", "三", "四", "五", "六"],
		monthNames: ["1月", "2月", "3月", "4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月", "12月"],
		yearMonth: (year, month) => year + "年" + month + "月"
	},
	en: {
		inputError: "Invalid input or no events",
		checkParameters: "Check the widget parameter",
		countdown: "Countdown",
		unsupported: "Unsupported widget size",
		now: "Now",
		today: "Today",
		yesterday: "Yesterday",
		dayBeforeYesterday: "Two days ago",
		tomorrow: "Tomorrow",
		dayAfterTomorrow: "In 2 days",
		daysAgo: days => days + " days ago",
		daysLater: days => "In " + days + " days",
		startTime: "Starts",
		endTime: "Ends",
		weekdays: ["S", "M", "T", "W", "T", "F", "S"],
		weekdayNames: ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"],
		monthNames: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
		yearMonth: (year, month) => ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][month-1] + " " + year
	}
};

const systemLanguage = (Device.language() || Device.preferredLanguages()[0] || "en").toLowerCase();
const uiLanguage = languageMode === "zh" || languageMode === "en"
	? languageMode
	: (systemLanguage.startsWith("zh") ? "zh" : "en");

var input = args.widgetParameter||"";
var names = input.split(".");
var calendars = [];
var orgnCals = await Calendar.forEvents();
for(var cal of orgnCals){
	calendars.push(cal.title);
}
const calNames = calendars.join("/");
const nowDate = new Date(); // 现在时间
const todayDate = new Date(new Date().setHours(0, 0, 0, 0)); // 今日00:00:00.000
const errEve = [tr("inputError"),tr("checkParameters"),"",tr("countdown"),"","808080","error"];
//小组件类型（accessoryRectangular、small、medium、large、extraLarge）
const widgSize = config.runsInWidget ? config.widgetFamily : "medium";

//Scriptable小组件创建
const widget = await createWidget();

if( !config.runsInWidget ){
  switch (widgSize) {
    case "accessoryRectangular":
      await widget.presentAccessoryRectangular();
      break;
    case "small":
      await widget.presentSmall();
      break;
    case "medium":
      await widget.presentMedium();
      break;
    case "large":
      await widget.presentLarge();
      break;
    case "extraLarge":
	  await widget.presentExtraLarge();
      break;
  }
}
Script.setWidget(widget);
Script.complete();

/**
 * 事件Widget绘制函数
 * @returns ListWidget
 */
async function createWidget() {
	var widget = new ListWidget();
	var limit = 0; // 小组件参数限制
	switch (widgSize) {
		case 'accessoryRectangular': limit = 2;
			var eventss = [];
			if( names.length>limit ){ eventss = [[errEve]]; }
			else{
				for( var i=0;i<names.length;i++ ){
					if( names[i] == "" ){ names[i] = calNames; }
					eventss.push( await getEventsBy(names[i]) );
				}
			}
			setLockWidget(widget,eventss); // 创建锁屏小组件
			break;
		case 'small': limit = 5;
			if( names.length===1 && names[0]==="$month" ){
				var monDic = await getMonDic();
				widget.size = new Size(154, 150);
				var horizontalStack = widget.addStack();
				horizontalStack.layoutHorizontally(); // 水平布局
				var onlyStack = horizontalStack.addStack();
				onlyStack.size = new Size(154, 150);
				// onlyStack.backgroundColor = Color.gray();
				await setMonthWidget(onlyStack,monDic,weekStartsMonday); // 创建日历小组件
			}
			else if( names.length===1 && names[0]==="$today" ){
				widget.size = new Size(154, 154);
				var horizontalStack = widget.addStack();
				horizontalStack.layoutHorizontally(); // 水平布局
				var onlyStack = horizontalStack.addStack();
				onlyStack.size = new Size(154, 154);
				// onlyStack.backgroundColor = Color.gray();
				setTodayWidget(onlyStack); // 创建今日小组件
			}
			else{
				var eventss = [];
				if( names.length>limit ){ eventss = [[errEve]]; }
				else{
					for( var i=0;i<names.length;i++ ){
						if( names[i] == "" ){ names[i] = calNames; }
						eventss.push( await getEventsBy(names[i]) );
					}
				}
				widget.size = new Size(140, 140);
				var onlyStack = widget.addStack();
				onlyStack.size = new Size(140, 140);
				// onlyStack.backgroundColor  = Color.gray();
				setDayMatterWidget(onlyStack,eventss,"small"); // 创建倒数日小组件
			}
			break;
		case 'medium': limit = 5;
            var eventss = [];
			if( names.length>limit ){ eventss = [[errEve]]; }
			else{
				for( var i=0;i<names.length;i++ ){
					if( names[i] == "" ){ names[i] = calNames; }
					eventss.push( await getEventsBy(names[i]) );
				}
			}
            var monDic = await getMonDic();
			widget.size = new Size(300, 150); 
			var horizontalStack = widget.addStack();
			horizontalStack.layoutHorizontally(); // 水平布局
			// 添加间隔
			horizontalStack.addSpacer();
			// 创建左侧视图
			var leftStack = horizontalStack.addStack();
			leftStack.size = new Size(140, 150);
    		// leftStack.backgroundColor = Color.gray();
			setDayMatterWidget(leftStack,eventss,"medium"); // 创建倒数日小组件
			// 添加间隔
			horizontalStack.addSpacer(6);
			// 创建右侧视图
			var rightStack = horizontalStack.addStack();
			rightStack.size = new Size(154, 150);
    		// rightStack.backgroundColor = Color.gray();
			await setMonthWidget(rightStack,monDic,weekStartsMonday); // 创建日历小组件
			// 添加间隔
			horizontalStack.addSpacer();
			break;
		case 'large': limit = 5;
			var eventss = [];
			if( names.length>limit ){ eventss = [[errEve]]; }
			else{
				for( var i=0;i<names.length;i++ ){
					if( names[i] == "" ){ names[i] = calNames; }
					eventss.push( await getEventsBy(names[i]) );
				}
			}
			var monDic = await getMonDic();
			widget.size = new Size(300, 300);
			var horizontalStack = widget.addStack();
			horizontalStack.layoutHorizontally(); // 水平布局
			// 添加间隔
			horizontalStack.addSpacer();
			// 创建左侧视图
			var leftStack = horizontalStack.addStack();
			leftStack.size = new Size(140, 300);
			// leftStack.backgroundColor = Color.gray();
			setDayMatterWidget(leftStack,eventss,"large"); // 创建倒数日小组件
			// 添加间隔
			horizontalStack.addSpacer(6);
			// 创建右侧视图
			var rightStack = horizontalStack.addStack();
			rightStack.size = new Size(154, 300);
			rightStack.layoutVertically(); // 垂直布局
			// 添加间隔
			rightStack.addSpacer();
			// 创建右侧上视图
			var rightTopStack = rightStack.addStack();
			rightTopStack.size = new Size(154, 100);
			// rightTopStack.backgroundColor = Color.gray();
			setTodayWidget(rightTopStack); // 创建今日小组件
			// 添加间隔
			rightStack.addSpacer(30);
			// 创建右侧下视图
			var rightBottomStack = rightStack.addStack();
			rightBottomStack.size = new Size(154, 140);
			// rightBottomStack.backgroundColor = Color.gray();
			await setMonthWidget(rightBottomStack,monDic,weekStartsMonday); // 创建日历小组件
			// 添加间隔
			rightStack.addSpacer();
			// 添加间隔
			horizontalStack.addSpacer();
			break;
		case 'extraLarge': limit = 5;
			var eventss = [];
			if( names.length>limit ){ eventss = [[errEve]]; }
			else{
				for( var i=0;i<names.length;i++ ){
					if( names[i] == "" ){ names[i] = calNames; }
					eventss.push( await getEventsBy(names[i]) );
				}
			}
            var monDic = await getMonDic();
			widget.size = new Size(620, 300); 
			var horizontalStack = widget.addStack();
			horizontalStack.layoutHorizontally(); // 水平布局
			// 添加间隔
			horizontalStack.addSpacer();
			// 创建左侧视图
			var leftStack = horizontalStack.addStack();
			leftStack.size = new Size(140, 300);
			// leftStack.backgroundColor = Color.gray();
			setDayMatterWidget(leftStack,eventss,"extraLarge"); // 创建倒数日小组件
			// 添加间隔
			horizontalStack.addSpacer(5);
			// 创建右侧视图
			var rightStack = horizontalStack.addStack();
			rightStack.size = new Size(475, 300);
			// rightStack.backgroundColor = Color.gray();
			await setBigMonthWidget(rightStack,monDic,weekStartsMonday); // 创建日历大组件
			// 添加间隔
			horizontalStack.addSpacer();
			break;
		default:
			widget.addText(tr("unsupported"));
	}
	return widget;
}

/**
 * 锁屏小组件创建函数
 * @param {*} widget 事件绘制函数 createWidget() 的实例
 * @param {*} eventss 根据参数获取事件 getEventsBy() 返回的数组
 * @returns 
 */
function setLockWidget(widget,eventss){
    if( eventss.length === 1 ){ // 对于只有一个参数的创建
        var events1 = eventss[0];
		switch(true){
			case events1.length === 1: 
				var day = widget.addText("⏱️"+events1[0][3]);
				day.font = Font.boldSystemFont(11);
				day.leftAlignText();
				var title = widget.addText(events1[0][0]);
				title.font = Font.boldSystemFont(11.5);
				title.centerAlignText();
				var date1 = widget.addText(events1[0][1]);
				date1.font = Font.italicSystemFont(9.5);
				date1.textOpacity = 0.6;
				date1.rightAlignText();
				var date2 = widget.addText(events1[0][2]);
				date2.font = Font.italicSystemFont(9.5);
				date2.textOpacity = 0.6;
				date2.rightAlignText();
				break;
			case events1.length === 2:
				var day = widget.addText("⏱️"+events1[0][3]);
				day.font = Font.boldSystemFont(11);
				day.leftAlignText();
				var title = widget.addText(events1[0][0]);
				title.font = Font.boldSystemFont(11.5);
				title.centerAlignText();
				var date = widget.addText(isPastEvent(events1[0]) ? events1[0][2] : events1[0][1]);
				date.font = Font.italicSystemFont(9.5);
				date.textOpacity = 0.6;
				date.rightAlignText();
				var space = widget.addText(' ');
				space.font = Font.boldSystemFont(1);
				addLockEventRow(widget,events1[1],events1[0],0.8);
				break;
			case events1.length >= 3:
				if( events1[0][6] === "now" || events1[0][6] === "today" ){
					var day = widget.addText("⏱️"+events1[0][3]);
					day.font = Font.boldSystemFont(11);
					day.leftAlignText();
					var title = widget.addText(events1[0][0]);
					title.font = Font.boldSystemFont(11.5);
					title.centerAlignText();
					var date = widget.addText(events1[0][6] === "now" ? events1[0][2] : events1[0][1]);
					date.font = Font.italicSystemFont(9.5);
					date.textOpacity = 0.6;
					date.rightAlignText();
					var space = widget.addText(' ');
					space.font = Font.boldSystemFont(1);
					addLockEventRow(widget,events1[1],events1[0],0.8);
				}else{
					var line = widget.addText("⏱️"+tr("countdown"));
					line.font = Font.boldSystemFont(11);
					line.leftAlignText();
					var space = widget.addText(' ');
					space.font = Font.boldSystemFont(1);
					for(var i=0;i<events1.length;i++){
						if( i === 4 ){ break; }
						addLockEventRow(widget,events1[i],i>0 ? events1[i-1] : null,0.6);
					}
				}
				break;
			default: return;
		}
	}
	if(eventss.length === 2){ // 对于有两个参数的创建
		var events1 = eventss[0];
		//console.log(events1);
		var events2 = eventss[1];
		//console.log(events2);
		switch(true){
			case ( events1[0][6] === "now" || events1[0][6] === "today" ):
				var day = widget.addText("⏱️"+events1[0][3]);
				day.font = Font.boldSystemFont(11);
				day.leftAlignText();
                // 第一个参数的事件
				var title1_1 = widget.addText(events1[0][0]);
				title1_1.font = Font.boldSystemFont(11.5);
				title1_1.centerAlignText();
				var date1_1 = widget.addText(events1[0][6] === "now" ? events1[0][2] : events1[0][1]);
				date1_1.font = Font.italicSystemFont(9.5);
				date1_1.textOpacity = 0.5;
				date1_1.rightAlignText();
				var space = widget.addText(' ');
				space.font = Font.boldSystemFont(1);
                // 第二个参数的事件
				// 剔除第二个参数中与第一个参数重复的事件
				for( var i=events2.length-1;i>=0;i-- ){
					if( JSON.stringify(events2[i]) === JSON.stringify(events1[0]) ){
						events2.splice(i,1);
					}
				}
				addLockEventRow(widget,events2[0],events1[0],0.7);
				if( events2.length>1 ){ // 如果第二个参数的事件大于一个
					if( events2[1][3] === events2[0][3] ){ //如果第二个事件和第一个事件天数一样，则不显示天数
						addLockEventRow(widget,events2[1],events2[0],0.7);
					}
				}
				break;
			default:
				var day = widget.addText("⏱️"+events1[0][3]);
				day.font = Font.boldSystemFont(11);
				day.leftAlignText();
                // 第一个参数的事件
				var title1_1 = widget.addText(events1[0][0]);
				title1_1.font = Font.boldSystemFont(11.5);
				title1_1.centerAlignText();
				var space = widget.addText(' ');
				space.font = Font.boldSystemFont(1);
                // 第二个参数的事件
				// 剔除第二个参数中与第一个参数重复的事件
				for( var i=events2.length-1;i>=0;i-- ){
					if( JSON.stringify(events2[i]) === JSON.stringify(events1[0]) ){
						events2.splice(i,1);
					}
				}
				addLockEventRow(widget,events2[0],events1[0],0.7);
                if( events2.length>1 ){ // 如果第二个参数的事件大于一个
					addLockEventRow(widget,events2[1],events2[0],0.7);
                }
		}
	}
}

/**
 * 添加锁屏小组件事件行。相邻事件倒数日相同时隐藏标签文字，
 * 但保留与上一行相同宽度的标签区域，使标题左侧严格对齐。
 * @param {*} widget 锁屏小组件
 * @param {*} event 当前事件
 * @param {*} previousEvent 上一个显示的事件
 * @param {number} opacity 文字透明度
 */
function addLockEventRow(widget,event,previousEvent,opacity){
	var hideDayDesc = previousEvent && event[3] === previousEvent[3];
	var row = widget.addStack();
	row.layoutHorizontally();
	row.centerAlignContent();

	var dayLabelArea = row.addStack();
	dayLabelArea.size = new Size(getRelativeLabelWidth(event[3]),11);
	var dayLabel = dayLabelArea.addText(event[3]);
	dayLabel.font = Font.boldSystemFont(10);
	dayLabel.lineLimit = 1;
	dayLabel.minimumScaleFactor = 0.8;
	dayLabel.textOpacity = hideDayDesc ? 0 : opacity;

	row.addSpacer(4);
	var title = row.addText(event[0]);
	title.font = Font.boldSystemFont(10);
	title.leftAlignText();
	title.lineLimit = 1;
	title.textOpacity = opacity;
	title.minimumScaleFactor = 0.8;
}
/**
 * 桌面小组件创建函数-倒数日
 * @param {*} widget 事件绘制函数 createWidget() 的实例
 * @param {*} eventss 根据参数获取事件 getEventsBy() 返回的数组
 * @param {string} widgetSize 桌面小组件类型
 */
function setDayMatterWidget(widget,eventss,widgetSize){ // 140*125
	//console.log(eventss);
	var high = 125;
	if( widgSize==="large" || widgSize==="extraLarge" ){ high = 300; }
	widget.layoutVertically(); // 垂直布局
	widget.addSpacer();
	var allEvent = widget.addStack();
	allEvent.size = new Size(140, high);
	allEvent.layoutVertically();
	// allEvent.topAlignContent();
	allEvent.addSpacer(); // 垂直居中，与上一行顶部对齐冲突，二选一
	var topEvents = []; // 已“固定”的事件
	var usedHeight = 0; // 已使用高度；两行标题会占用更多空间
	for( var i=0;i<eventss.length;i++ ){
		if( i<eventss.length-1 ){ // 这里是要“固定”的事件
			while( eventss[i].length>0 && topEvents.some( event => 
				JSON.stringify(event) === JSON.stringify(eventss[i][0])
			) ){ // 如果该参数第一个事件已被固定，从该参数事件中移除，直至没有被固定的
				eventss[i].shift();
			}
			var hideDayDesc = topEvents.length>0 && eventss[i][0][3]===topEvents[topEvents.length-1][3];
			var titleText = eventss[i][0][3]+" "+eventss[i][0][0];
			var titleHeight = getEventTitleHeight(titleText);
			var oneEventHeight = titleHeight+10;
			if( usedHeight+oneEventHeight+2>high ){ break; }
			var oneEvent = allEvent.addStack();
			oneEvent.size = new Size(140, oneEventHeight);
			oneEvent.layoutVertically();
			var oneEveTitle = oneEvent.addStack();
			oneEveTitle.size = new Size(140, titleHeight);
			oneEveTitle.layoutHorizontally();
			oneEveTitle.bottomAlignContent();
			var signArea = oneEveTitle.addStack();
			signArea.size = new Size(3, titleHeight);
			signArea.layoutVertically();
			signArea.addSpacer(2);
			var sign = signArea.addStack();
			sign.size = new Size(3, titleHeight-3);
			sign.cornerRadius = 9;
			sign.backgroundColor = new Color("#"+eventss[i][0][5]);
			signArea.addSpacer(1);
			oneEveTitle.addSpacer(4);
			var titleArea = oneEveTitle.addStack();
			titleArea.size = new Size(133, titleHeight);
			titleArea.layoutHorizontally();
			titleArea.topAlignContent();
			var dayLabelWidth = getRelativeLabelWidth(eventss[i][0][3]);
			var dayLabelArea = titleArea.addStack();
			dayLabelArea.size = new Size(dayLabelWidth, titleHeight);
			dayLabelArea.layoutVertically();
			var dayLabel = dayLabelArea.addText(eventss[i][0][3]);
			dayLabel.font = Font.boldSystemFont(11);
			dayLabel.lineLimit = 1;
			dayLabel.minimumScaleFactor = 0.8;
			if( hideDayDesc ){ dayLabel.textOpacity = 0; }
			titleArea.addSpacer(4);
			var eventTitleArea = titleArea.addStack();
			eventTitleArea.size = new Size(129-dayLabelWidth, titleHeight);
			eventTitleArea.layoutVertically();
			var title = eventTitleArea.addText(eventss[i][0][0]);
			title.font = Font.boldSystemFont(11);
			title.leftAlignText();
			title.lineLimit = 2;
			title.minimumScaleFactor=0.8;
			var oneEveDate = oneEvent.addStack();
			oneEveDate.size = new Size(140, 10);
			oneEveDate.layoutHorizontally();
			oneEveDate.topAlignContent();
			oneEveDate.addSpacer();
			var date = oneEveDate.addText(isPastEvent(eventss[i][0]) ? eventss[i][0][2] : eventss[i][0][1]);
			date.font = Font.italicSystemFont(10);
			date.rightAlignText();
			date.minimumScaleFactor=0.9;
			date.textOpacity = 0.4;

			var oneSpacer = allEvent.addStack();
			oneSpacer.size = new Size(140, 2);
			usedHeight += oneEventHeight+2;

			topEvents.push(eventss[i][0]);
			
		}
		else{ // 这里是不固定的
			var unpin = 0; // 根据固定事件数量决定不固定事件数量
			if( widgetSize==="large" || widgetSize==="extraLarge" ){
				if( i===0 ){ unpin = 15; }
				if( i===1 ){ unpin = 12; }
				if( i===2 ){ unpin = 11; }
				if( i===3 ){ unpin = 9; }
				if( i===4 ){ unpin = 8; }
			}
			else{
				if( i===0 ){ unpin = 6; }
				if( i===1 ){ unpin = 5; }
				if( i===2 ){ unpin = 3; }
				if( i===3 ){ unpin = 2; }
				if( i===4 ){ unpin = 0; }
			}
			for( var j=0;j<unpin;j++ ){
				if( j>=eventss[i].length ){ // 不能超出事件数量
					break;
				}
				if( topEvents.some( event => 
					JSON.stringify(event)===JSON.stringify(eventss[i][j])
				) ){
					eventss[i].splice(j,1); // 从这个数组中移除
					j--; // 索引前移
					continue;
				}
				var previousDayDesc = j>0
					? eventss[i][j-1][3]
					: (topEvents.length>0 ? topEvents[topEvents.length-1][3] : null);
				var hideDayDesc = eventss[i][j][3]===previousDayDesc;
				var titleText = eventss[i][j][3]+" "+eventss[i][j][0];
				var titleHeight = getEventTitleHeight(titleText);
				var perEventHeight = titleHeight+3;
				if( usedHeight+perEventHeight>high ){ break; }
				var perEvent = allEvent.addStack();
				perEvent.size = new Size(140, perEventHeight);
				perEvent.layoutVertically();
				var perEveTitle = perEvent.addStack();
				perEveTitle.size = new Size(140, titleHeight);
				perEveTitle.layoutHorizontally();
				perEveTitle.bottomAlignContent();
				var signArea = perEveTitle.addStack();
				signArea.size = new Size(3, titleHeight);
				signArea.layoutVertically();
				signArea.addSpacer(2);
				var sign = signArea.addStack();
				sign.size = new Size(3, titleHeight-3);
				sign.cornerRadius = 9;
				sign.backgroundColor = new Color("#"+eventss[i][j][5]);
				signArea.addSpacer(1);
				perEveTitle.addSpacer(4);
				var titleArea = perEveTitle.addStack();
				titleArea.size = new Size(133, titleHeight);
				titleArea.layoutHorizontally();
				titleArea.topAlignContent();
				var dayLabelWidth = getRelativeLabelWidth(eventss[i][j][3]);
				var dayLabelArea = titleArea.addStack();
				dayLabelArea.size = new Size(dayLabelWidth, titleHeight);
				dayLabelArea.layoutVertically();
				var dayLabel = dayLabelArea.addText(eventss[i][j][3]);
				dayLabel.font = Font.boldSystemFont(11);
				dayLabel.lineLimit = 1;
				dayLabel.minimumScaleFactor = 0.8;
				if( hideDayDesc ){ dayLabel.textOpacity = 0; }
				titleArea.addSpacer(4);
				var eventTitleArea = titleArea.addStack();
				eventTitleArea.size = new Size(129-dayLabelWidth, titleHeight);
				eventTitleArea.layoutVertically();
				var title = eventTitleArea.addText(eventss[i][j][0]);
				title.font = Font.boldSystemFont(11);
				title.leftAlignText();
				title.lineLimit = 2;
				title.minimumScaleFactor=0.8;
				usedHeight += perEventHeight;
			}
		}
	}
	allEvent.addSpacer();
	widget.addSpacer();
}

/**
 * 桌面小组件创建函数-今日
 * @param {*} widget 
 */
function setTodayWidget(widget){ // 130*100
	var today = new Date();
	var weekdayParts = uiLanguage === "zh"
		? ["星", "期", translations.zh.weekdayNames[today.getDay()]]
		: translations.en.weekdayNames[today.getDay()].split("");
	var year = today.getFullYear();
	var month = today.getMonth()+1;	

	widget.layoutHorizontally(); // 水平布局
	widget.centerAlignContent(); // 内容居中
	widget.addSpacer();

	var widgetinStack = widget.addStack();
	widgetinStack.size = new Size(130,100);
	widgetinStack.layoutVertically(); // 垂直布局
	widgetinStack.centerAlignContent(); // 内容居中
	widgetinStack.addSpacer();

	var desc1Stack = widgetinStack.addStack();
	desc1Stack.size = new Size(130,25);
	// desc1Stack.backgroundColor = Color.gray();
	desc1Stack.layoutHorizontally();
	desc1Stack.centerAlignContent();
	desc1Stack.addSpacer();
	var text1 = desc1Stack.addText(tr("yearMonth", year, month));
	text1.centerAlignText();
	text1.font = Font.boldSystemFont(18);
	text1.minimumScaleFactor = 0.6;
	text1.textOpacity = 0.6;
	desc1Stack.addSpacer();

	var desc2Stack = widgetinStack.addStack();
	desc2Stack.size = new Size(130,75);
	// desc2Stack.backgroundColor = Color.blue();
	desc2Stack.layoutHorizontally();
	desc2Stack.centerAlignContent();
	desc2Stack.addSpacer();

	var desc2_1Stack = desc2Stack.addStack();
	desc2_1Stack.size = new Size(100, 75);
	desc2_1Stack.layoutHorizontally();
	desc2_1Stack.centerAlignContent();
	// desc2_1Stack.backgroundColor = Color.blue();
	var todayText = desc2_1Stack.addText(today.getDate().toString());
	todayText.font = Font.boldSystemFont(75);

	var desc2_2Stack = desc2Stack.addStack();
	desc2_2Stack.size = new Size(30, 75);
	desc2_2Stack.layoutVertically();
	desc2_2Stack.centerAlignContent();
	// desc2_2Stack.backgroundColor = Color.yellow();
	desc2_2Stack.addSpacer();

	var week1Stack = desc2_2Stack.addStack();
	week1Stack.size = new Size(30, 20);
	week1Stack.layoutHorizontally();
	week1Stack.centerAlignContent();
	var week1Text = week1Stack.addText(weekdayParts[0]);
	week1Text.font = Font.boldSystemFont(16);
	week1Text.textColor = Color.red();

	var week2Stack = desc2_2Stack.addStack();
	week2Stack.size = new Size(30, 20);
	week2Stack.layoutHorizontally();
	week2Stack.centerAlignContent();
	var week2Text = week2Stack.addText(weekdayParts[1]);
	week2Text.font = Font.boldSystemFont(16);
	week2Text.textColor = Color.red();

	var week3Stack = desc2_2Stack.addStack();
	week3Stack.size = new Size(30, 20);
	week3Stack.layoutHorizontally();
	week3Stack.centerAlignContent();
	var week3Text = week3Stack.addText(weekdayParts[2]);
	week3Text.font = Font.boldSystemFont(16);
	week3Text.textColor = Color.red();

	desc2_2Stack.addSpacer();
	desc2Stack.addSpacer();
	widgetinStack.addSpacer();
	widget.addSpacer();
}

/**
 * 桌面小组件创建函数-日历
 * @param {*} widget 事件绘制函数 createWidget() 的实例
 * @param {*} monDic 获取当月每天事件 getMonDic() 返回的数据
 * @param {boolean} weekStartsMonday 是否周一作为周起始
 */
async function setMonthWidget(widget,monDic,weekStartsMonday){ // 154*125
	//console.log(monDic);
	widget.layoutVertically(); // 垂直布局
	widget.addSpacer();
	//添加当月描述
	var monthDesc = widget.addStack();
	monthDesc.layoutHorizontally(); // 水平布局

		var nationMonth = monthDesc.addStack();
		nationMonth.size = new Size(35, 12);
		nationMonth.centerAlignContent();
		nationMonth.addSpacer();
		var currMonNum = new Date().getMonth()+1;
		var nationText = nationMonth.addText(translations[uiLanguage].monthNames[currMonNum-1]);
		nationText.rightAlignText();
		nationText.font = Font.boldSystemFont(11);
		nationText.textColor = Color.red();

		var space = monthDesc.addStack();
		space.size = new Size(10, 12);
		space.layoutVertically();
			var line = space.addStack();
			line.size = new Size(10, 10);
			line.layoutHorizontally();
				var inner = line.addStack();
				inner.size = new Size(1, 10);
				inner.backgroundColor = Color.gray();

		var subtitleStack = monthDesc.addStack();
		subtitleStack.size = new Size(100, 12);
		subtitleStack.bottomAlignContent();
		var subtitleText = subtitleStack.addText( getMonthSubtitle() );
		subtitleText.font = Font.boldSystemFont(9.5);
		subtitleText.textOpacity = 0.4;
		subtitleText.leftAlignText();
		subtitleStack.addSpacer();

	monthDesc.addSpacer();
	
	widget.addSpacer(5);
	
	// 添加周几指示行
	var columnTitle = widget.addStack();
	columnTitle.layoutHorizontally();
	var localizedWeekdays = translations[uiLanguage].weekdays;
	var dayTitles = weekStartsMonday ? localizedWeekdays.slice(1).concat(localizedWeekdays[0]) : localizedWeekdays;
	for(var title of dayTitles){
		var titleStack = columnTitle.addStack();
		titleStack.size = new Size(18, 18);
		titleStack.centerAlignContent();		
		var titleText = titleStack.addText(title);
		titleText.font = Font.boldSystemFont(10);
		if ( localizedWeekdays[6] === title || localizedWeekdays[0] === title ){titleText.textOpacity = 0.4;}

		var spacStack = columnTitle.addStack();
		spacStack.size = new Size(4, 15);
	}
	columnTitle.addSpacer();

	// 添加每周对应的日
	var calendarData = calendarCal(weekStartsMonday);
	for (var week of calendarData) {
		var weekStack = widget.addStack();
		weekStack.layoutHorizontally();

		for(var day of week){
			var dayStack = weekStack.addStack();
			dayStack.size = new Size(18, 18);
			dayStack.layoutHorizontally();
			dayStack.centerAlignContent();
			// dayStack.backgroundColor = Color.gray();
			var dayInStack = dayStack.addStack();
			dayInStack.size = new Size(17, 17);
			dayInStack.layoutHorizontally();
			dayInStack.centerAlignContent();
			// dayInStack.backgroundColor = Color.red();
			dayInStack.cornerRadius = 9; // 圆角
			var eventsStack = weekStack.addStack();
			eventsStack.size = new Size(3, 18);
			eventsStack.layoutVertically();

			var dvStack = weekStack.addStack();
			dvStack.size = new Size(1, 18);
			
			// day渲染填充
			if( hideOtherMonth && !day.isInMonth ){ continue; } // 如果隐藏非当月的日期，跳过非当月的日期
			var dayText = dayInStack.addText(day.day.toString());
			dayText.centerAlignText();
			dayText.font = Font.boldSystemFont(10.5);
			// 周六日渲染，字体透明度
			if( day.isWeekend ){ dayText.textOpacity = 0.4; }
			if( showRestFeature ){
				// 休班渲染，字体透明度
				if( monDic[day.date].some( item=>item.calendar==restCalendarTitle&&item.title.includes(restEventTitle) ) ){ dayText.textOpacity = 0.4; }
				if( monDic[day.date].some( item=>item.calendar==restCalendarTitle&&item.title.includes(workEventTitle) ) ){ dayText.textOpacity = 1; }
			}
			// 当天渲染，红色背景
			if( day.isToday ){ dayText.textColor = Color.white(); dayInStack.backgroundColor = Color.red(); }
			// 非本月渲染
			if( !day.isInMonth ){ dayText.font = Font.systemFont(9.5); }
			
			// day事件渲染  3*3 隔1，18/(3+1) = 4个事件指示
			var eventNum = 4;
			if( Object.keys(monDic).length>0 ){
				var i = 0;
				for(var dayInfo of monDic[day.date]){
					i++;
					if( i>eventNum ){ break; }
					if( !dayInfo.color ){ continue; }
					if( hideRestEvent ){
						// 在事件指示器中跳过休班事件渲染
						if( dayInfo.calendar==restCalendarTitle && (dayInfo.title.includes(restEventTitle)||dayInfo.title.includes(workEventTitle)) ){ continue; }
					}
					var eventStack = eventsStack.addStack();
					eventStack.size = new Size(3, 3);
					eventStack.cornerRadius = 9; // 圆角
					eventStack.backgroundColor = new Color("#"+dayInfo.color);
					if( i<monDic[day.date].length && i<eventNum ){
						var spaceStack = eventsStack.addStack();
						spaceStack.size = new Size(3, 1);
					}
				}
			}

		}
		weekStack.addSpacer();
	}
	widget.addSpacer();
}
/**
 * 桌面超大组件创建函数-日历
 * @param {*} widget 事件绘制函数 createWidget() 的实例
 * @param {*} monDic 获取当月每天事件 getMonDic() 返回的数据
 * @param {*} weekStartsMonday 是否周一作为周起始
 */
async function setBigMonthWidget(widget,monDic,weekStartsMonday){ // 475*254
	widget.layoutVertically(); // 垂直布局
	widget.addSpacer();
	//添加当月描述
	var monthDesc = widget.addStack();
	monthDesc.size = new Size(465, 24);
	monthDesc.layoutHorizontally();

	var nationMonth = monthDesc.addStack();
		nationMonth.size = new Size(40, 20);
		nationMonth.centerAlignContent();
		nationMonth.addSpacer();
		var currMonNum = new Date().getMonth()+1;
		var nationText = nationMonth.addText(translations[uiLanguage].monthNames[currMonNum-1]);
		nationText.font = Font.boldSystemFont(18);
		nationText.textColor = Color.red();
		nationText.rightAlignText();

		var space = monthDesc.addStack();
		space.size = new Size(20, 20);
		space.layoutVertically();
			var line = space.addStack();
			line.size = new Size(20, 15);
			line.layoutHorizontally();
				var inner = line.addStack();
				inner.size = new Size(1, 15);
				inner.backgroundColor = Color.gray();

		var subtitleStack = monthDesc.addStack();
		subtitleStack.size = new Size(300, 20);
		subtitleStack.bottomAlignContent();
		var subtitleText = subtitleStack.addText( getMonthSubtitle() );
		subtitleText.font = Font.boldSystemFont(12);
		subtitleText.textOpacity = 0.4;
		subtitleText.leftAlignText();
		subtitleStack.addSpacer();
	
	monthDesc.addSpacer();

	widget.addSpacer(10);
	
	// 添加周几指示行
	var columnTitle = widget.addStack();
	columnTitle.layoutHorizontally();
	columnTitle.centerAlignContent();
	var localizedWeekdays = translations[uiLanguage].weekdays;
	var dayTitles = weekStartsMonday ? localizedWeekdays.slice(1).concat(localizedWeekdays[0]) : localizedWeekdays;
	for(var title of dayTitles){
		var titleStack = columnTitle.addStack();
		titleStack.size = new Size(22, 22);
		titleStack.centerAlignContent();		
		var titleText = titleStack.addText(title);
		titleText.font = Font.boldSystemFont(15);
		if ( localizedWeekdays[6] === title || localizedWeekdays[0] === title ){ titleText.textOpacity = 0.4; }

		var spaceStack = columnTitle.addStack();
		spaceStack.size = new Size(45, 40);
	}

	// 添加每周对应的日
	var calendarData = calendarCal(weekStartsMonday);
	for(var week of calendarData){
		var weekStack = widget.addStack();
		weekStack.layoutHorizontally();
		weekStack.centerAlignContent();

		for(var day of week){
			var dayStack = weekStack.addStack();
			dayStack.size = new Size(22, 22);
			dayStack.layoutHorizontally();
			dayStack.centerAlignContent();
			dayStack.cornerRadius = 5; // 圆角
			
			var eventsStack = weekStack.addStack();
			eventsStack.size = new Size(45, 40);
			eventsStack.layoutVertically();
			
			// day渲染填充
			if( hideOtherMonth && !day.isInMonth ){ continue; } // 如果隐藏非当月的日期，跳过非当月的日期
			var dayText = dayStack.addText(day.day.toString());
			dayText.font = Font.boldSystemFont(15);
			//周六日渲染，字体透明度
			if( day.isWeekend ){ dayText.textOpacity = 0.4; }
			if( showRestFeature ){
				// 休班渲染，字体透明度
				if( monDic[day.date].some( item=>item.calendar==restCalendarTitle&&item.title.includes(restEventTitle) ) ){ dayText.textOpacity = 0.4; }
				if( monDic[day.date].some( item=>item.calendar==restCalendarTitle&&item.title.includes(workEventTitle) ) ){ dayText.textOpacity = 1; }
			}
			//当天渲染，红色背景
			if( day.isToday ){ dayText.textColor = Color.white(); dayStack.backgroundColor = Color.red(); }
			// 非本月渲染
			if( !day.isInMonth ){ dayText.font = Font.systemFont(12.5); }
			
			//添加该day事件指示 45*10 不隔，40/10 = 4个事件指示
			var eventNum = 4;
			if( Object.keys(monDic).length>0 ){
				var i = 0;
				for(var dayInfo of monDic[day.date]){
					i++;
					if( i>eventNum ){ break; }
					if( !dayInfo.color ){ continue; }
					if( hideRestEvent ){
						// 在事件指示器中跳过休班事件渲染
						if( dayInfo.calendar==restCalendarTitle && (dayInfo.title.includes(restEventTitle)||dayInfo.title.includes(workEventTitle)) ){ continue; }
					}
					var eventStack = eventsStack.addStack();
					eventStack.size = new Size(45, 10);
					var title = eventStack.addText(dayInfo.title);
					title.font = Font.boldSystemFont(8);
					title.textColor = new Color("#"+dayInfo.color);
				}
			}
		}
	}
	widget.addSpacer();
}

//****************************日历核心算法******************************

/**
 * 根据参数获取日历中的事件
 * @param {*} pram 输入的参数，可识别为日历组合、日历、事件
 * @returns Array
 */
async function getEventsBy(pram){
	var events = [];
    var name = pram.split("/");
    if( name.length>1 ){//是一个日历组合
        try{
            for(var nam of name){
                var event = await CalendarEvent.between(nowDate, getNewDate(nowDate,5), [await Calendar.forEventsByTitle(nam)]);
                for(var eve of event){ events.push(eve); }
            }
        }catch(err){ events = [errEve]; }
    }else{
        try{//是一个日历
            var event = await CalendarEvent.between(nowDate, getNewDate(nowDate,5), [await Calendar.forEventsByTitle(name[0])]);
            for( var eve of event ){ events.push(eve); }
        }catch(err){//是一个事件
            var event = await CalendarEvent.between(nowDate, getNewDate(nowDate,5));
			for(var eve of event){
				if( eve.title === name[0] ){ events.push(eve); }
			}
			if( events.length === 0 ){ // 如果没有标题事件，查找包含标题事件
				for(var eve of event){
					if( eve.title.includes(name[0]) ){ events.push(eve); }
				}
			}
			if( events.length === 0 ){ // 如果都没有，查找以前到现在的
				// 只进行精准查找，一年一年往前找，找到就停止，最多找100年
				outerLoop:
				for( var i=0;i>-100;i-- ){
					var event = await CalendarEvent.between(getNewDate(nowDate,i-1), getNewDate(nowDate,i));
					innerLoop:
					for(var eve of event){
						if( eve.title === name[0] ){ events.push(eve); break outerLoop;}
					}
				}
			}
        }
    }
    if( events.length === 0 ){
		events = [errEve];
	}
    else{//有事件处理
        events = events.sort( dateData("startDate","endDate") );
        if( events.length>20 ){ events = events.slice(0,20); }
        events = dealEvents(events);
    }
	return events;
}
/**
 * 获取当月每天的事件
 * @returns object
 */
async function getMonDic(){
    var monDic = {};
    var calendarData = calendarCal(weekStartsMonday);
	for(var week of calendarData) {
		for(var day of week){
			// if( !day.isInMonth ){ continue; }
			var startTime = new Date( new Date(day.date.toLocaleDateString()).getTime() );// 该day 0点
			var endTime = new Date(startTime.getTime()+864e5-1);// 该day 23:59:59点
			var dayEvents = [];

			var event = await CalendarEvent.between(startTime, endTime, await Calendar.forEvents());
			for(var eve of event){ dayEvents.push(eve); }

			if( dayEvents.length===0 ){
				dayEvents = [errEve];
			}
			else{//有事件处理
				dayEvents = dayEvents.sort(dateData("startDate","endDate"));
				dayEvents = dealEvents(dayEvents);
			}

			var dayInfo = [];
			for(var dayEvent of dayEvents){
				dayInfo.push({title:dayEvent[0],calendar:dayEvent[4],color:dayEvent[5]});
			}
			monDic[day.date] = dayInfo;
		}
	}
    return monDic;
}

/**
 * 返回一个比较函数，用于按两个日期字段排序对象数组。
 * 先按第一个字段排序（升序），若相同则按第二个字段排序（升序）
 * @param {string} primaryField 第一排序字段（如 'startDate'）
 * @param {string} secondaryField 第二排序字段（如 'endDate'）
 * @returns {function} 比较函数
 */
function dateData(primaryField, secondaryField) {
    return function(a, b) {
        // 获取并解析主字段的时间戳
        var date1 = Date.parse(a[primaryField]);
        var date2 = Date.parse(b[primaryField]);
        // 先比较主字段
        if (date1 !== date2) {
            return date1 - date2; // 升序
        }
        // 主字段相同，比较次字段
        var secDate1 = Date.parse(a[secondaryField]);
        var secDate2 = Date.parse(b[secondaryField]);
        return secDate1 - secDate2; // 升序
    };
}
/**
 * 将获取的日历原生事件数据格式化处理
 * @param {*} prams 日历原生事件数据
 * @returns 
 */
function dealEvents(prams){
	var newEves = [];
	var dateFormatter = new DateFormatter();
	dateFormatter.locale = uiLanguage === "zh" ? "zh_CN" : "en_US";
	dateFormatter.dateFormat = uiLanguage === "zh" ? "yyyy.M.d HH:mm" : "MMM d, yyyy HH:mm";
	for(var pram of prams){
		var dayState = null;
		var dayValue = null;
		var startFromNow = (pram.startDate-nowDate)/1000/60/60/24; // 事件开始时间距离现在的天数
		var startFromToday = (pram.startDate-todayDate)/1000/60/60/24; // 事件开始时间距离今日0点的天数
		var endFromNow = (pram.endDate-nowDate)/1000/60/60/24; // 事件结束时间距离现在的天数
		var endFromToday = (pram.endDate-todayDate)/1000/60/60/24; // 事件结束时间距离今日0点的天数
		if( startFromToday<0 ){ // 如果开始时间在今天之前
			if( endFromNow>=0 ){ dayState = "now"; }
			else if( endFromToday>0 ){ dayState = "today"; }
			else{
				if( startFromToday<-2 ){ dayState = "daysAgo"; dayValue = Math.abs(Math.floor(startFromToday)); }
				else if( startFromToday<-1 ){ dayState = "dayBeforeYesterday"; }
				else if( startFromToday>=-1 ){ dayState = "yesterday"; }
			}
		}
		else if( startFromToday<1 ){
			if( startFromNow<=0 && endFromNow>=0 ){ dayState = "now"; }
			else{ dayState = "today"; }
		}
		else if( startFromToday>=3 ){ dayState = "daysLater"; dayValue = Math.floor(startFromToday); }
		else if( startFromToday>=2 ){ dayState = "dayAfterTomorrow"; }
		else if( startFromToday>=1 ){ dayState = "tomorrow"; }
		var dayDesc = formatRelativeDay(dayState, dayValue);
		
		var aa = pram.title;
		if( aa.includes("生日") ){ aa=pram.title.replace(/^.*?(?=的)/,"某人"); }
		else if( /birthday/i.test(aa) ){
			// 同时兼容直引号、弯引号和 modifier letter apostrophe，例如 John's、John’s、Johnʼs
			aa=pram.title.replace(/^.*?(?=['’ʼ]s\b)/i,"Sb");
		}

		newEves.push([aa,pram.startDate,pram.endDate,dayDesc,pram.calendar.title,pram.calendar.color.hex,dayState]);
	}
	for(var newEve of newEves){
		newEve[1] = tr("startTime")+': '+dateFormatter.string(new Date(newEve[1]));
		newEve[2] = tr("endTime")+': '+dateFormatter.string(new Date(newEve[2]));
	}
	return newEves;
}
/**
 * 当月日历事件处理
 * @param {boolean} weekStartsMonday 是否周一作为周起始
 * @returns 
 */
function calendarCal(weekStartsMonday){
	var today = new Date();
	var currentMonth = today.getMonth();
	var currentYear = today.getFullYear();
	// 如果周一为起始则周一下标置为1
	var weekStart = weekStartsMonday ? 1 : 0;
	// 对于月份不以周开始的情况，提前设置天数计数
	// 设置为-6是因为它将立即递增到-5，它将在月份的第一天之前获得6天，因为0不是月份的第一天
	var dayCount = -6;
	// 存储日期和周
	var days = [];
	// 循环以获取日历的所有日期
	while(true){
		dayCount++;
		// 获取下一个日期
		let date = new Date(currentYear, currentMonth, dayCount);
		// 如果是第一个日期且不是周开始的日子，则不添加该日期
		if( days.length === 0 && date.getDay() !== weekStart ){ continue; }
		// 如果达到不是此刻月份的周开始日期，退出循环
		else if( days.length !== 0 && date.getDay() === weekStart && date.getMonth() !== currentMonth ){ break; }
		days.push({
			day: date.getDate(),
			date: date,
			isInMonth: date.getMonth() === currentMonth,
			isToday: date.getDate() === today.getDate() && date.getMonth() === today.getMonth(),
			isWeekend: date.getDay() === 6 || date.getDay() === 0
		})
	}
	// 存储一个包含周数组的二维数组
	var month = [];
	for(let i = 0; i < days.length; i += 7){
		month.push(days.slice(i, i + 7));
	}
	return month;
}

/**
 * 将输入的时间加多少年
 * @param {Date} nowDate 输入的时间
 * @param {Number} years 多少年
 * @returns Date
 */
function getNewDate(nowDate,years){
	return new Date(nowDate.getFullYear() + years, 
				nowDate.getMonth(), 
				nowDate.getDate(), 
				nowDate.getHours(), 
				nowDate.getMinutes(), 
				nowDate.getSeconds(), 
				nowDate.getMilliseconds());
}

/**
 * 获取月历标题右侧的自定义文字
 * @returns string
 */
function getMonthSubtitle(){
	if( typeof monthSubtitle === "string" ){ return monthSubtitle; }
	return monthSubtitle[uiLanguage] || monthSubtitle.zh || monthSubtitle.en || "";
}

/**
 * 获取本地化文本
 * @param {string} key 文本键
 * @param  {...any} values 插值参数
 * @returns string
 */
function tr(key,...values){
	var value = translations[uiLanguage][key];
	return typeof value === "function" ? value(...values) : value;
}

/**
 * 将事件的日期状态转换为本地化文字
 * @param {string} state 日期状态
 * @param {number} value 天数
 * @returns string
 */
function formatRelativeDay(state,value){
	return tr(state,value);
}

/**
 * 判断事件是否正在进行或已经过去
 * @param {Array} event 格式化后的事件
 * @returns boolean
 */
function isPastEvent(event){
	return ["now","yesterday","dayBeforeYesterday","daysAgo"].includes(event[6]);
}

/**
 * 根据标题的估算显示宽度，返回单行或双行文字区域高度
 * @param {string} text 完整的倒数日标题
 * @returns number
 */
function getEventTitleHeight(text){
	var estimatedWidth = estimateTextWidth(text);
	return estimatedWidth>133 ? 26 : 15;
}

/**
 * 估算 11pt 粗体文字的显示宽度
 * @param {string} text 文字
 * @returns number
 */
function estimateTextWidth(text){
	var estimatedWidth = 0;
	for( var char of text ){
		if( /\s/.test(char) ){ estimatedWidth += 3.5; }
		else if( char.charCodeAt(0)<=127 ){ estimatedWidth += 6; }
		else{ estimatedWidth += 11; }
	}
	return estimatedWidth;
}

/**
 * 返回倒数日标签区域宽度；相同标签始终得到相同宽度
 * @param {string} text 倒数日标签
 * @returns number
 */
function getRelativeLabelWidth(text){
	return Math.min(78,Math.max(18,Math.ceil(estimateTextWidth(text))));
}
