/*
 * @page：学生接收器模拟socket mock数据
 * @author: chenzhou
 * @update: 2017.06.08
 * @desc 模拟发消息，ppt， 试卷，试题，红包等
 *
 */

module.exports = {
  hello: {
    'op': 'hello',
    'lessonid': 564,
    'presentation': 21,
    'slideindex': 2,
    'slideid': 123, // 与slideindex 2存在1
    'unlockedproblem': [2, 3],
    'danmu': false,
    'timeline': [
        {
            'type': 'event',
            'title': '上课啦',
            'dt': 1453348609053  //Datetime 时间戳
        },
        {
            'type': 'slide',
            'pres': 21, // Presentation ID
            'si': 1, // SlideIndex，幻灯片序号
            'sid': 120, // SlideId，与si 2存在1
            'dt': 1453348909053  //Datetime 时间戳
        },
        {
            'type': 'slide',
            'pres': 21, // Presentation ID
            'si': 2, // SlideIndex，幻灯片序号
            'sid': 121, // SlideId，与si 2存在1
            'dt': 1453348919053  //Datetime 时间戳
        },
        {
            'type': 'slide',
            'pres': 21, // Presentation ID
            'si': 3, // SlideIndex，幻灯片序号
            'sid': 123, // SlideId，与si 2存在1
            'dt': 1453348929053  //Datetime 时间戳
        },
        {
            'type': 'problem',
            'prob': 100, // Problem ID
            'pres': 21, // Presentation ID
            'si': 4, // SlideIndex，幻灯片序号
            'sid': 123, // SlideId，与si 2存在1
            'dt': 1453348959053,  //Datetime 时间戳
            'limit': 60 //-1为不限时，以秒为单位，60为一分钟
        },
        {
            'type': 'problem',
            'prob': 123, // Problem ID
            'pres': 21, // Presentation ID
            'si': 5, // SlideIndex，幻灯片序号
            'sid': 123, // SlideId，与si 2存在1
            'dt': 1453348959053,  //Datetime 时间戳
            'limit': 60 //-1为不限时，以秒为单位，60为一分钟
        },
        {
            'type': 'quiz',
            'quiz': 12,
            'title': '试卷标题',
            'total': 12,
            'dt': 1453348969053  //Datetime 时间戳
        }
    ]
  }
}
