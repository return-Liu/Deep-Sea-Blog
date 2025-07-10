// 用Mockjs模拟总访问量和今日访问量数据
import Mock from "mockjs";
// 总访问量
const totalVisits = Mock.mock({
  // 属性total的值是数字，范围是100到1000 1表示每次递增1
  "total|1000-2000": 1,
});
// 今日访问量
const todayVisits = Mock.mock({
  // 属性today的值是数字，范围是50到500 1表示每次递增1
  "today|500-1000": 1,
});
export default {
  totalVisits: totalVisits.total,
  todayVisits: todayVisits.today,
};
