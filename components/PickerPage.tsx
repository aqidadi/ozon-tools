"use client";

import { useState } from "react";
import { ExternalLink, Copy, Check, ChevronDown, ChevronRight } from "lucide-react";

const CATEGORIES = [
  {
    emoji: "🧸", name: "毛绒玩具", color: "pink",
    items: [
      { label: "猫咪抱枕", kw: "猫咪 毛绒 抱枕 可爱", hot: true },
      { label: "柴犬玩偶", kw: "柴犬 毛绒玩具 公仔", hot: true },
      { label: "兔子毛绒", kw: "兔子 毛绒玩具 大号", hot: true },
      { label: "熊猫玩偶", kw: "熊猫 毛绒公仔 抱枕", hot: false },
      { label: "鳄鱼长条枕", kw: "鳄鱼 长条抱枕 毛绒", hot: true },
      { label: "草莓熊", kw: "草莓熊 毛绒玩具 公仔", hot: true },
      { label: "青蛙玩偶", kw: "青蛙 毛绒 坐姿 玩偶", hot: false },
      { label: "龙猫玩偶", kw: "龙猫 毛绒玩具 宫崎骏", hot: false },
      { label: "卡皮巴拉", kw: "卡皮巴拉 水豚 毛绒 玩具", hot: true },
      { label: "鸭子玩偶", kw: "大黄鸭 毛绒 玩偶 抱枕", hot: false },
      { label: "羊驼玩偶", kw: "羊驼 草泥马 毛绒 公仔", hot: false },
      { label: "恐龙玩偶", kw: "恐龙 毛绒玩具 儿童", hot: false },
      { label: "熊抱枕被", kw: "熊 抱枕被 两用 毛绒", hot: true },
      { label: "奶龙玩偶", kw: "奶龙 毛绒 公仔 玩具", hot: true },
      { label: "星黛露", kw: "星黛露 毛绒 迪士尼 公仔", hot: false },
      { label: "玲娜贝儿", kw: "玲娜贝儿 毛绒 迪士尼", hot: false },
      { label: "布偶猫玩偶", kw: "布偶猫 毛绒 仿真 玩偶", hot: true },
      { label: "大号毛绒熊", kw: "大号泰迪熊 毛绒 180cm", hot: false },
      { label: "毛绒书包挂件", kw: "毛绒 书包挂件 公仔 小号", hot: true },
      { label: "睡觉抱枕", kw: "长条 睡觉抱枕 毛绒 夹腿", hot: true },
    ],
  },
  {
    emoji: "🎎", name: "棉花娃娃", color: "rose",
    items: [
      { label: "棉花娃娃素体", kw: "棉花娃娃 素体 20cm", hot: true },
      { label: "娃衣套装", kw: "棉花娃娃 娃衣 汉服 套装", hot: true },
      { label: "娃娃配件背包", kw: "棉花娃娃 配件 背包 小包", hot: false },
      { label: "中华娘娃衣", kw: "棉花娃娃 汉服 中华娘 娃衣", hot: true },
      { label: "娃娃展示盒", kw: "棉花娃娃 展示盒 亚克力", hot: false },
      { label: "JK制服娃衣", kw: "棉花娃娃 JK 制服 娃衣", hot: true },
      { label: "旗袍娃衣", kw: "棉花娃娃 旗袍 古风 娃衣", hot: false },
      { label: "娃娃假发", kw: "棉花娃娃 假发 毛线 多色", hot: false },
      { label: "娃娃鞋子", kw: "棉花娃娃 鞋子 配件 小鞋", hot: false },
      { label: "素体25cm", kw: "棉花娃娃 素体 25cm 正版", hot: true },
      { label: "婚纱娃衣", kw: "棉花娃娃 婚纱 白色 娃衣", hot: false },
      { label: "娃娃帽子", kw: "棉花娃娃 帽子 配件 贝雷帽", hot: false },
    ],
  },
  {
    emoji: "🎁", name: "盲盒手办", color: "purple",
    items: [
      { label: "泡泡玛特同款", kw: "盲盒 手办 潮玩 摆件", hot: true },
      { label: "拉布布手办", kw: "拉布布 LABUBU 盲盒 手办", hot: true },
      { label: "Dimoo系列", kw: "Dimoo 盲盒 手办 泡泡玛特", hot: false },
      { label: "小甜豆手办", kw: "小甜豆 盲盒 摆件 手办", hot: false },
      { label: "SKULLPANDA", kw: "SKULLPANDA 盲盒 手办", hot: true },
      { label: "盲盒收纳展示柜", kw: "盲盒 收纳柜 展示架 亚克力", hot: true },
      { label: "盲袋手办", kw: "盲袋 手办 随机 摆件", hot: false },
      { label: "扭蛋机", kw: "扭蛋机 家用 儿童 玩具", hot: true },
      { label: "迷你手办桌摆", kw: "迷你手办 桌面摆件 Q版", hot: false },
      { label: "福袋盲盒", kw: "福袋 盲盒 随机款 玩具", hot: false },
    ],
  },
  {
    emoji: "🚀", name: "儿童玩具", color: "blue",
    items: [
      { label: "泡泡枪", kw: "儿童泡泡枪 电动 玩具枪", hot: true },
      { label: "磁力片积木", kw: "磁力片 儿童积木 益智", hot: true },
      { label: "遥控汽车", kw: "遥控汽车 儿童 玩具车", hot: true },
      { label: "拼图玩具", kw: "儿童拼图 益智 幼儿", hot: false },
      { label: "沙画玩具", kw: "沙画 儿童玩具 彩沙", hot: false },
      { label: "水弹枪", kw: "水弹枪 儿童玩具 软弹", hot: true },
      { label: "气球套装", kw: "气球 儿童玩具 打气筒套装", hot: false },
      { label: "儿童厨房玩具", kw: "儿童 厨房 玩具 过家家", hot: true },
      { label: "芭比娃娃同款", kw: "换装娃娃 洋娃娃 女孩玩具", hot: false },
      { label: "儿童画板", kw: "儿童 液晶画板 写字板 玩具", hot: true },
      { label: "感统训练玩具", kw: "感统 平衡板 儿童训练", hot: false },
      { label: "儿童沙滩玩具", kw: "沙滩玩具 儿童 挖沙套装", hot: false },
      { label: "弹弓玩具", kw: "儿童 弹弓 安全软弹 玩具", hot: false },
      { label: "儿童相机", kw: "儿童相机 数码 玩具相机", hot: true },
      { label: "万花筒", kw: "万花筒 儿童 科普 玩具", hot: false },
    ],
  },
  {
    emoji: "💄", name: "美妆工具", color: "pink",
    items: [
      { label: "卷发棒", kw: "卷发棒 自动 陶瓷 不伤发", hot: true },
      { label: "睫毛夹", kw: "睫毛夹 局部夹 定型 持久", hot: true },
      { label: "美容仪", kw: "射频美容仪 家用 提拉紧致", hot: true },
      { label: "洗脸仪", kw: "洗脸仪 硅胶 声波 清洁", hot: false },
      { label: "发梳气垫梳", kw: "气垫梳 按摩梳 头皮 梳子", hot: false },
      { label: "修眉刀", kw: "修眉刀 女用 眉毛 剃眉", hot: true },
      { label: "美甲工具套装", kw: "美甲 工具套装 DIY 家用", hot: true },
      { label: "粉扑气垫", kw: "粉扑 气垫 化妆海绵 散粉", hot: false },
      { label: "化妆刷套装", kw: "化妆刷 套装 全套 初学者", hot: false },
      { label: "去黑头仪", kw: "去黑头仪 吸黑头 毛孔清洁", hot: true },
      { label: "美妆镜LED", kw: "化妆镜 LED 补光 台式", hot: true },
      { label: "卸妆仪", kw: "卸妆仪 超声波 洁面仪", hot: false },
      { label: "眼皮贴", kw: "眼皮贴 双眼皮 隐形 自然", hot: false },
      { label: "粉底刷", kw: "粉底刷 斜头刷 散粉刷", hot: false },
      { label: "美容滚轮", kw: "玫瑰石英 滚轮 面部按摩", hot: true },
      { label: "自动眉笔", kw: "自动眉笔 防水 持久 极细", hot: true },
      { label: "遮瑕盘", kw: "遮瑕盘 调色 多色 遮痘印", hot: false },
    ],
  },
  {
    emoji: "🏠", name: "家居收纳", color: "teal",
    items: [
      { label: "桌面收纳盒", kw: "桌面收纳盒 办公 透明 整理", hot: true },
      { label: "硅胶防滑垫", kw: "硅胶 防滑垫 餐垫 隔热", hot: false },
      { label: "壁挂挂钩", kw: "粘钩 无痕挂钩 承重 墙壁", hot: true },
      { label: "收纳袋真空", kw: "真空收纳袋 压缩袋 衣物", hot: true },
      { label: "磁吸调味罐", kw: "磁吸调味罐 厨房 收纳 套装", hot: false },
      { label: "抽屉整理盒", kw: "抽屉 整理盒 分格 内衣收纳", hot: true },
      { label: "折叠洗脸盆", kw: "折叠盆 硅胶 洗脸盆 便携", hot: false },
      { label: "多功能收纳架", kw: "收纳架 落地 多层 置物架", hot: true },
      { label: "密封罐套装", kw: "密封罐 玻璃 厨房 食品储存", hot: false },
      { label: "脏衣篓折叠", kw: "脏衣篓 折叠 收纳篮 家用", hot: false },
      { label: "冰箱收纳盒", kw: "冰箱收纳盒 保鲜盒 分隔", hot: true },
      { label: "行李箱收纳袋", kw: "旅行收纳袋 分装袋 套装", hot: false },
      { label: "悬挂式收纳", kw: "悬挂式收纳袋 门后 挂袋", hot: false },
      { label: "锅具收纳架", kw: "锅盖架 厨房置物架 锅具", hot: false },
      { label: "化妆品收纳盒", kw: "化妆品收纳盒 亚克力 透明", hot: true },
    ],
  },
  {
    emoji: "📱", name: "手机配件", color: "gray",
    items: [
      { label: "磁吸手机支架", kw: "MagSafe 磁吸支架 桌面 手机", hot: true },
      { label: "编织数据线", kw: "编织 数据线 快充 1米 多合一", hot: true },
      { label: "手机壳透明", kw: "手机壳 透明 防摔 全包", hot: false },
      { label: "磁吸无线充电", kw: "磁吸 无线充电器 快充", hot: true },
      { label: "蓝牙耳机", kw: "TWS蓝牙耳机 半入耳 降噪", hot: true },
      { label: "手机散热器", kw: "手机散热器 半导体 降温", hot: true },
      { label: "钢化膜", kw: "手机钢化膜 全屏 高清 防摔", hot: false },
      { label: "手机挂绳", kw: "手机挂绳 斜挎 编织 背带", hot: true },
      { label: "充电宝超薄", kw: "充电宝 超薄 轻便 10000mAh", hot: true },
      { label: "手机指环扣", kw: "手机指环扣 支架 金属 防摔", hot: false },
      { label: "蓝牙自拍杆", kw: "自拍杆 蓝牙 三脚架 补光", hot: false },
      { label: "车载手机架", kw: "车载手机架 出风口 磁吸 支架", hot: true },
      { label: "快充头GaN", kw: "GaN氮化镓 充电头 多口 快充", hot: true },
      { label: "Type-C转接头", kw: "Type-C 转接头 多功能 HUB", hot: false },
      { label: "手机相机镜头", kw: "手机 外置镜头 广角 微距", hot: false },
      { label: "手机消毒盒", kw: "手机消毒盒 紫外线 UV 杀菌", hot: false },
    ],
  },
  {
    emoji: "💍", name: "饰品首饰", color: "yellow",
    items: [
      { label: "小众设计项链", kw: "小众 项链 锁骨链 ins 设计感", hot: true },
      { label: "珍珠耳环", kw: "珍珠 耳环 气质 优雅 女", hot: true },
      { label: "星月发夹套装", kw: "发夹 套装 发卡 抓夹 鲨鱼夹", hot: true },
      { label: "戒指套装", kw: "戒指 套装 多件套 轻奢 女款", hot: false },
      { label: "手链编织", kw: "手链 编织 闺蜜 手工 串珠", hot: true },
      { label: "金属发箍", kw: "金属发箍 高级感 宽边 发饰", hot: true },
      { label: "耳夹无耳洞", kw: "耳夹 无耳洞 耳骨夹 女", hot: true },
      { label: "胸针别针", kw: "胸针 创意 可爱 卡通 别针", hot: false },
      { label: "脚链", kw: "脚链 女 沙滩 夏季 ins风", hot: false },
      { label: "水晶串珠手链", kw: "水晶 串珠 手链 DIY 天然", hot: true },
      { label: "蝴蝶结发饰", kw: "蝴蝶结 发饰 头绳 丝绒 甜美", hot: true },
      { label: "镶钻耳钉", kw: "耳钉 镶钻 简约 小巧 女", hot: false },
      { label: "圆形墨镜", kw: "墨镜 圆框 防紫外线 时尚 女", hot: false },
      { label: "腰链", kw: "腰链 金属 时尚 装饰 女", hot: false },
    ],
  },
  {
    emoji: "🐾", name: "宠物用品", color: "orange",
    items: [
      { label: "猫咪隧道玩具", kw: "猫咪 隧道 玩具 帐篷 折叠", hot: true },
      { label: "逗猫棒", kw: "逗猫棒 羽毛 电动 自嗨 猫玩具", hot: true },
      { label: "宠物梳毛器", kw: "宠物梳毛 撸毛器 猫狗 脱毛", hot: true },
      { label: "猫薄荷玩具", kw: "猫薄荷 玩具 木天蓼 猫咪", hot: false },
      { label: "宠物饮水机", kw: "宠物 自动饮水机 循环 猫", hot: true },
      { label: "猫咪零食袋", kw: "猫咪 零食袋 猫条 零食包", hot: false },
      { label: "宠物衣服", kw: "宠物衣服 猫狗 可爱 小型犬", hot: true },
      { label: "自动猫砂盆", kw: "自动猫砂盆 电动 清洁 猫厕所", hot: true },
      { label: "宠物背包", kw: "宠物外出背包 猫包 透明舱", hot: true },
      { label: "磨爪板", kw: "猫 磨爪板 瓦楞纸 猫抓板", hot: false },
      { label: "狗狗牵引绳", kw: "狗绳 牵引绳 弹力 胸背带", hot: false },
      { label: "宠物窝垫", kw: "宠物 猫窝 狗垫 睡觉 四季", hot: true },
      { label: "宠物指甲刀", kw: "宠物 指甲剪 猫狗 磨甲器", hot: false },
      { label: "慢食碗", kw: "宠物 慢食碗 防噎 猫狗碗", hot: false },
      { label: "宠物项圈", kw: "宠物项圈 发光 卡通 猫狗", hot: true },
    ],
  },
  {
    emoji: "🏃", name: "运动户外", color: "green",
    items: [
      { label: "跳绳计数", kw: "跳绳 计数 成人 速跳 儿童", hot: true },
      { label: "瑜伽垫防滑", kw: "瑜伽垫 防滑 加厚 环保 TPE", hot: true },
      { label: "弹力带套装", kw: "弹力带 健身 阻力带 套装", hot: true },
      { label: "泡沫轴", kw: "泡沫轴 筋膜轴 肌肉放松 按摩", hot: false },
      { label: "健腹轮", kw: "健腹轮 静音 回弹 腹肌 家用", hot: true },
      { label: "运动护腕护膝", kw: "运动护腕 护膝 篮球 护具", hot: false },
      { label: "折叠水壶", kw: "折叠水壶 运动 硅胶 便携", hot: false },
      { label: "登山杖", kw: "登山杖 折叠 超轻 碳纤维", hot: false },
      { label: "钓鱼小配件", kw: "钓鱼 浮漂 鱼钩 渔具配件", hot: false },
      { label: "运动手套", kw: "运动手套 骑行 健身 防滑", hot: false },
      { label: "迷你按摩枪", kw: "按摩枪 迷你 便携 肌肉放松", hot: true },
      { label: "颈部按摩仪", kw: "颈部按摩仪 热敷 护颈 电动", hot: true },
      { label: "坐姿矫正器", kw: "坐姿矫正器 背部 脊椎 成人", hot: true },
      { label: "哑铃套装", kw: "哑铃 包胶 女用 家用 健身", hot: false },
    ],
  },
  {
    emoji: "🎨", name: "文创文具", color: "indigo",
    items: [
      { label: "高颜值笔记本", kw: "笔记本 A5 手账本 线圈本", hot: true },
      { label: "荧光笔套装", kw: "荧光笔 马卡龙 彩色 记号笔", hot: false },
      { label: "印章套装", kw: "印章 手账 装饰 复古 文具", hot: true },
      { label: "卡通便利贴", kw: "便利贴 卡通 可爱 便签本", hot: true },
      { label: "透明卷笔刀", kw: "卷笔刀 透明 电动 文具", hot: false },
      { label: "水彩颜料套装", kw: "水彩颜料 固体 24色 学生", hot: true },
      { label: "DIY相册", kw: "DIY相册 手工 拍立得 照片册", hot: true },
      { label: "复古蜡封套装", kw: "蜡封 漆封 封蜡 复古 印章", hot: true },
      { label: "流体画套装", kw: "流体画 丙烯 DIY 马克龙", hot: false },
      { label: "钢笔墨水", kw: "钢笔 彩色墨水 分装 学生", hot: false },
      { label: "贴纸套装", kw: "贴纸 手账 DIY 装饰 可爱", hot: true },
      { label: "台灯护眼", kw: "台灯 护眼 学生 LED 充电", hot: true },
      { label: "数字油画", kw: "数字油画 填色 DIY 手工 涂色", hot: false },
    ],
  },
  {
    emoji: "🎀", name: "节日礼品", color: "red",
    items: [
      { label: "妇女节礼盒", kw: "38妇女节 礼盒 送女友 套装", hot: true },
      { label: "圣诞装饰挂件", kw: "圣诞 装饰 挂件 雪花 圣诞树", hot: true },
      { label: "生日礼盒空盒", kw: "生日礼物 礼盒 空盒 包装盒", hot: true },
      { label: "告白气球套装", kw: "气球 告白 生日 装饰套装", hot: false },
      { label: "香薰蜡烛礼盒", kw: "香薰蜡烛 礼盒 精油 生日", hot: true },
      { label: "情侣手环对戒", kw: "情侣 手环 对戒 磁吸 礼物", hot: true },
      { label: "新年春节摆件", kw: "春节 新年 摆件 装饰 福字", hot: false },
      { label: "感恩节礼品", kw: "感恩节 礼品 礼物 包装", hot: false },
      { label: "毕业纪念礼物", kw: "毕业 纪念 礼物 定制 学士帽", hot: false },
      { label: "七夕情人节", kw: "七夕 情人节 礼物 浪漫 送女友", hot: true },
      { label: "儿童节礼物", kw: "儿童节 礼物 玩具 礼盒 六一", hot: false },
      { label: "母亲节礼物", kw: "母亲节 礼物 送妈妈 护肤 礼盒", hot: true },
    ],
  },
  {
    emoji: "🌿", name: "美容护肤", color: "green",
    items: [
      { label: "泥膜清洁", kw: "泥膜 清洁 毛孔 收缩 面膜", hot: true },
      { label: "精华液安瓶", kw: "精华液 安瓶 淡斑 抗衰 玻尿酸", hot: true },
      { label: "蒸脸器", kw: "蒸脸器 热喷 补水 家用", hot: true },
      { label: "防晒喷雾", kw: "防晒喷雾 SPF50 轻薄 便携", hot: true },
      { label: "眼膜贴", kw: "眼膜 黑眼圈 淡化 补水 眼贴", hot: false },
      { label: "卸妆水", kw: "卸妆水 温和 深层清洁 敏感肌", hot: false },
      { label: "身体乳套装", kw: "身体乳 滋润 香味 套装 礼盒", hot: true },
      { label: "去角质磨砂膏", kw: "磨砂膏 去角质 身体 嫩滑", hot: false },
      { label: "唇膜唇贴", kw: "唇膜 唇贴 滋润 去死皮 唇部", hot: true },
      { label: "美白牙贴", kw: "美白牙贴 亮白 冷光美白 牙齿", hot: true },
      { label: "护手霜套装", kw: "护手霜 套装 保湿 滋润 礼盒", hot: false },
      { label: "发膜护发素", kw: "发膜 护发素 修复 受损 烫染发", hot: false },
    ],
  },
  {
    emoji: "🍳", name: "厨房小物", color: "orange",
    items: [
      { label: "硅胶锅铲套装", kw: "硅胶 锅铲 套装 耐高温 厨具", hot: true },
      { label: "手动切菜神器", kw: "切菜神器 手动 切丁 切片 切丝", hot: true },
      { label: "密封食品夹", kw: "密封夹 食品 保鲜 封口 夹子", hot: false },
      { label: "剥蒜器", kw: "剥蒜器 硅胶 大蒜 去皮 厨房", hot: true },
      { label: "磁力刀架", kw: "磁力刀架 壁挂 刀具 收纳", hot: false },
      { label: "手动榨汁杯", kw: "榨汁杯 手动 便携 柠檬 橙汁", hot: true },
      { label: "硅胶冰格模具", kw: "冰格 硅胶 制冰 模具 冰块", hot: false },
      { label: "可折叠漏勺", kw: "漏勺 可折叠 硅胶 滤水 厨房", hot: false },
      { label: "厨房计时器", kw: "厨房计时器 磁吸 电子 倒计时", hot: false },
      { label: "保温饭盒", kw: "保温饭盒 不锈钢 上班族 带饭", hot: true },
      { label: "迷你电热锅", kw: "迷你电热锅 宿舍 泡面 小火锅", hot: true },
      { label: "烤肉夹套装", kw: "烤肉夹 烧烤 工具套装 户外", hot: false },
    ],
  },
  {
    emoji: "🌙", name: "卧室寝室", color: "indigo",
    items: [
      { label: "氛围小夜灯", kw: "小夜灯 氛围灯 USB 卧室 感应", hot: true },
      { label: "星空投影灯", kw: "星空投影仪 卧室 氛围灯 旋转", hot: true },
      { label: "记忆棉枕头", kw: "记忆棉 枕头 护颈 慢回弹", hot: true },
      { label: "蚕丝眼罩", kw: "眼罩 蚕丝 遮光 睡眠 透气", hot: false },
      { label: "加湿器超声波", kw: "加湿器 超声波 卧室 静音 小型", hot: true },
      { label: "香薰机", kw: "香薰机 精油 扩香 卧室 USB", hot: true },
      { label: "懒人沙发床", kw: "懒人沙发 卧室 榻榻米 折叠", hot: false },
      { label: "挂耳式耳机架", kw: "耳机支架 桌面 收纳 挂钩", hot: false },
      { label: "防滑地垫", kw: "地垫 卧室 防滑 地毯 床边毯", hot: false },
      { label: "窗帘遮光布", kw: "遮光窗帘 卧室 全遮光 隔热", hot: true },
      { label: "电热毯", kw: "电热毯 双人 安全 调温 冬季", hot: false },
      { label: "乳胶枕", kw: "乳胶枕 泰国 天然 护颈 儿童", hot: false },
    ],
  },
  {
    emoji: "💻", name: "电脑周边", color: "blue",
    items: [
      { label: "鼠标垫超大", kw: "鼠标垫 超大 加厚 游戏 锁边", hot: true },
      { label: "USB分线器", kw: "USB HUB 扩展坞 多口 Type-C", hot: true },
      { label: "机械键盘",kw: "机械键盘 青轴 RGB 104键", hot: true },
      { label: "键盘腕托", kw: "键盘腕托 记忆棉 护腕 办公", hot: false },
      { label: "电脑支架", kw: "笔记本支架 折叠 散热 铝合金", hot: true },
      { label: "摄像头夹子", kw: "摄像头 HD 1080P USB 直播", hot: false },
      { label: "屏幕挂灯", kw: "屏幕挂灯 显示器 护眼 补光灯", hot: true },
      { label: "理线器套装", kw: "理线器 桌面 走线槽 整理 套装", hot: false },
      { label: "竖立收纳架", kw: "笔记本竖放支架 主机收纳 铝合金", hot: false },
      { label: "静音鼠标", kw: "静音鼠标 无线 办公 蓝牙 RGB", hot: true },
      { label: "桌面小风扇", kw: "桌面风扇 USB 小型 静音 夹式", hot: true },
    ],
  },
  {
    emoji: "🚗", name: "汽车用品", color: "gray",
    items: [
      { label: "车载香薰", kw: "车载香薰 出风口 固体 去味", hot: true },
      { label: "车载手机架", kw: "车载支架 磁吸 重力 出风口", hot: true },
      { label: "汽车座椅垫", kw: "汽车坐垫 四季 透气 防滑", hot: false },
      { label: "车载充电器", kw: "车载充电器 PD快充 多口 双USB", hot: true },
      { label: "车内挂件", kw: "车内挂件 后视镜 吊坠 装饰 水晶", hot: false },
      { label: "车用收纳袋", kw: "车用 椅背收纳袋 挂袋 后排", hot: false },
      { label: "车载垃圾桶", kw: "车载垃圾桶 悬挂 迷你 便携", hot: false },
      { label: "车窗遮阳帘", kw: "车窗遮阳帘 防紫外线 吸盘", hot: true },
      { label: "行车记录仪", kw: "行车记录仪 1080P 前后双录", hot: true },
      { label: "防滑脚垫", kw: "汽车脚垫 防滑 全包围 改装", hot: false },
    ],
  },
  {
    emoji: "🌱", name: "园艺绿植", color: "green",
    items: [
      { label: "多肉植物", kw: "多肉植物 盆栽 桌面 绿植 小盆", hot: true },
      { label: "创意花盆", kw: "创意花盆 陶瓷 卡通 小号 多肉", hot: true },
      { label: "自动浇花器", kw: "自动浇花器 懒人 滴灌 定时", hot: true },
      { label: "植物营养液", kw: "植物营养液 通用 绿植 水培", hot: false },
      { label: "苔藓微景观", kw: "苔藓 微景观 生态瓶 DIY 绿植", hot: true },
      { label: "多肉专用土", kw: "多肉 营养土 颗粒 透气 铺面石", hot: false },
      { label: "仙人掌盆栽", kw: "仙人掌 盆栽 小号 创意 桌面", hot: false },
      { label: "园艺工具套装", kw: "园艺工具 套装 铲子 松土 浇水", hot: false },
    ],
  },
  {
    emoji: "📸", name: "摄影配件", color: "purple",
    items: [
      { label: "手机补光灯", kw: "手机 补光灯 直播 环形 夹子", hot: true },
      { label: "迷你三脚架", kw: "三脚架 迷你 手机 便携 桌面", hot: true },
      { label: "拍照背景布", kw: "拍照 背景布 纯色 产品拍摄", hot: true },
      { label: "相机清洁套装", kw: "相机 清洁套装 气吹 镜头布", hot: false },
      { label: "拍立得相纸", kw: "拍立得 相纸 mini 通用 彩色", hot: true },
      { label: "GoPro配件", kw: "GoPro 配件 支架 固定 运动相机", hot: false },
      { label: "摄影反光板", kw: "反光板 折叠 补光 摄影 5合1", hot: false },
      { label: "直播麦克风", kw: "直播麦克风 领夹 手机 降噪", hot: true },
    ],
  },
  {
    emoji: "🧳", name: "旅行出行", color: "teal",
    items: [
      { label: "旅行分装瓶", kw: "旅行分装瓶 硅胶 套装 便携", hot: true },
      { label: "行李绑带", kw: "行李箱绑带 固定 防爆 十字", hot: false },
      { label: "旅行颈枕", kw: "记忆棉颈枕 飞机 旅行 U型枕", hot: true },
      { label: "便携挂衣绳", kw: "旅行晾衣绳 挂钩 弹力 便携", hot: false },
      { label: "护照夹", kw: "护照夹 多功能 防消磁 钱包", hot: true },
      { label: "防盗腰包", kw: "防盗腰包 隐形 旅行 出行 证件包", hot: true },
      { label: "旅行眼罩耳塞套装", kw: "旅行 眼罩 耳塞 套装 飞机", hot: false },
      { label: "行李牌标签", kw: "行李牌 标签 姓名 旅行 防丢", hot: false },
    ],
  },
  {
    emoji: "🎮", name: "游戏周边", color: "purple",
    items: [
      { label: "手机游戏手柄", kw: "手机游戏手柄 蓝牙 伸缩 安卓", hot: true },
      { label: "PS手柄支架", kw: "PS5 PS4 手柄 充电座 支架", hot: true },
      { label: "Switch配件", kw: "Switch 保护壳 手柄套 配件", hot: true },
      { label: "电竞椅护腰枕", kw: "电竞椅 护腰枕 记忆棉 坐垫", hot: false },
      { label: "游戏机散热风扇", kw: "游戏机 散热 风扇 底座 PS5", hot: false },
      { label: "卡通鼠标", kw: "卡通 鼠标 可爱 无线 发光", hot: true },
      { label: "手游辅助按键", kw: "手游 辅助 物理按键 吸盘 外设", hot: true },
      { label: "游戏耳机架", kw: "耳机架 桌面 游戏 RGB 支架", hot: false },
    ],
  },
  {
    emoji: "👕", name: "服装配件", color: "pink",
    items: [
      { label: "卡通袜子套装", kw: "卡通袜子 套装 纯棉 可爱 短袜", hot: true },
      { label: "基础款帽子", kw: "棒球帽 鸭舌帽 可调节 素色", hot: true },
      { label: "针织手套", kw: "针织手套 保暖 触屏 冬季 可爱", hot: false },
      { label: "围巾披肩", kw: "围巾 仿羊绒 保暖 女冬 纯色", hot: true },
      { label: "防晒袖套", kw: "防晒袖套 冰丝 防紫外线 夏季", hot: true },
      { label: "丝巾小方巾", kw: "丝巾 小方巾 发带 扎头 装饰", hot: false },
      { label: "腰封腰带", kw: "腰封 女款 弹力 配裙 装饰腰带", hot: false },
      { label: "包包挂件钥匙扣", kw: "包包挂件 钥匙扣 卡通 可爱 毛绒", hot: true },
    ],
  },
  {
    emoji: "🔦", name: "户外露营", color: "green",
    items: [
      { label: "折叠露营桌椅", kw: "折叠桌椅 露营 便携 铝合金", hot: true },
      { label: "户外LED灯串", kw: "LED灯串 户外 防水 露营 装饰", hot: true },
      { label: "便携防水收纳袋", kw: "防水袋 漂流 游泳 手机 密封", hot: false },
      { label: "露营气垫", kw: "充气垫 露营 气垫床 防潮 便携", hot: false },
      { label: "多功能军刀", kw: "多功能刀 户外 瑞士军刀 工具", hot: false },
      { label: "保温水杯", kw: "保温杯 户外 不锈钢 大容量 运动壶", hot: true },
      { label: "头灯LED", kw: "头灯 LED 户外 强光 USB充电", hot: true },
      { label: "防蚊手环", kw: "防蚊手环 儿童 户外 驱蚊", hot: true },
    ],
  },
  {
    emoji: "✨", name: "DIY手工", color: "yellow",
    items: [
      { label: "树脂艺术套装", kw: "UV树脂 艺术 DIY 滴胶 套装", hot: true },
      { label: "刺绣套装", kw: "刺绣 DIY 初学者 材料包 花卉", hot: true },
      { label: "钻石画套装", kw: "钻石画 DIY 满钻 风景 5D", hot: true },
      { label: "陶土黏土", kw: "轻黏土 软陶 彩泥 DIY 儿童", hot: false },
      { label: "皮革DIY套装", kw: "皮革 DIY 手工 工具套装 钱包", hot: false },
      { label: "蜡烛DIY材料", kw: "香薰蜡烛 DIY 材料包 大豆蜡", hot: true },
      { label: "水晶滴胶模具", kw: "水晶滴胶 硅胶模具 DIY 干花", hot: true },
      { label: "串珠材料包", kw: "串珠 材料包 手链 项链 DIY", hot: false },
    ],
  },
  {
    emoji: "📚", name: "教育学习", color: "blue",
    items: [
      { label: "益智积木套装", kw: "益智积木 STEM 儿童 拼装 玩具", hot: true },
      { label: "儿童早教卡片", kw: "早教卡片 识字 闪卡 双语 儿童", hot: false },
      { label: "数学教具", kw: "数学教具 计数棒 百格板 小学", hot: false },
      { label: "儿童英语绘本", kw: "英语绘本 儿童 故事 有声 读本", hot: false },
      { label: "写字板练习册", kw: "描红本 练字帖 幼儿 写字 练习", hot: false },
      { label: "科学实验套装", kw: "科学实验 儿童 DIY 套装 益智", hot: true },
      { label: "天文望远镜", kw: "天文望远镜 儿童 高清 入门 双筒", hot: false },
      { label: "地球仪发光", kw: "地球仪 发光 旋转 儿童 桌面", hot: true },
    ],
  },
  {
    emoji: "🎵", name: "音乐乐器", color: "orange",
    items: [
      { label: "尤克里里入门", kw: "尤克里里 入门 初学者 小吉他 21寸", hot: true },
      { label: "口琴入门", kw: "口琴 入门 C调 Blues 10孔", hot: false },
      { label: "卡林巴拇指琴", kw: "卡林巴 拇指琴 17音 入门", hot: true },
      { label: "电子钢琴61键", kw: "电子琴 61键 儿童 初学者 成人", hot: false },
      { label: "吉他拨片套装", kw: "吉他 拨片 材质 厚度 套装", hot: false },
      { label: "节拍器", kw: "节拍器 电子 调音器 二合一 乐器", hot: false },
      { label: "蓝牙音箱小型", kw: "蓝牙音箱 小型 便携 户外 防水", hot: true },
      { label: "降噪耳机头戴", kw: "头戴式耳机 主动降噪 无线 蓝牙", hot: true },
    ],
  },
  {
    emoji: "🧹", name: "清洁用品", color: "teal",
    items: [
      { label: "硅胶清洁刷", kw: "硅胶 清洁刷 多功能 厨房 浴室", hot: true },
      { label: "超细纤维毛巾", kw: "超细纤维 毛巾 吸水 速干 套装", hot: false },
      { label: "洗碗布不粘油", kw: "洗碗布 不粘油 双面 海绵 刷锅", hot: true },
      { label: "瓶刷套装", kw: "瓶刷 奶瓶刷 细长 套装 清洁", hot: false },
      { label: "地板清洁液", kw: "地板清洁液 木地板 瓷砖 多效", hot: false },
      { label: "马桶清洁块", kw: "马桶 清洁块 洁厕宝 蓝泡泡", hot: true },
      { label: "静电除尘纸", kw: "静电除尘纸 拖把 懒人 地板", hot: false },
      { label: "洗衣球防缠绕", kw: "洗衣球 防缠绕 硅胶 去污", hot: false },
    ],
  },
  {
    emoji: "🎪", name: "趣味新奇", color: "purple",
    items: [
      { label: "解压玩具捏捏乐", kw: "解压 捏捏乐 软胶 发泄 玩具", hot: true },
      { label: "磁铁玩具", kw: "磁铁 强力 玩具 创意 解压", hot: false },
      { label: "指尖陀螺", kw: "指尖陀螺 金属 解压 指间 玩具", hot: false },
      { label: "创意沙漏", kw: "沙漏 计时 创意 桌面 装饰", hot: true },
      { label: "液晶手写板", kw: "液晶手写板 无纸 儿童 画板 8.5寸", hot: true },
      { label: "投影玩具", kw: "小投影 迷你 儿童 故事机 投影", hot: false },
      { label: "木制解锁玩具", kw: "木制 解锁 鲁班锁 智力 玩具", hot: false },
      { label: "磁力钓鱼玩具", kw: "磁力钓鱼 儿童 玩具 益智 亲子", hot: false },
      { label: "陀螺发光", kw: "发光陀螺 儿童 旋转 LED 玩具", hot: true },
      { label: "泡泡机自动", kw: "泡泡机 自动 儿童 户外 彩色", hot: true },
    ],
  },
  {
    emoji: "🛁", name: "洗浴用品", color: "blue",
    items: [
      { label: "沐浴花球", kw: "沐浴球 沐浴花 搓澡 洁面 套装", hot: false },
      { label: "硅胶洗头刷", kw: "硅胶 洗头刷 按摩 去屑 成人", hot: true },
      { label: "牙刷收纳架", kw: "牙刷架 壁挂 吸盘 漱口杯套装", hot: false },
      { label: "沐浴盐套装", kw: "沐浴盐 海盐 磨砂 美白 礼盒", hot: true },
      { label: "搓背神器", kw: "搓背神器 长柄 搓澡巾 双面", hot: true },
      { label: "浴室防滑垫", kw: "浴室防滑垫 硅胶 吸盘 卫生间", hot: false },
      { label: "护发精油", kw: "护发精油 免洗 顺滑 烫染修复", hot: true },
      { label: "香皂香薰皂", kw: "手工皂 精油皂 香薰 洗脸 礼盒", hot: false },
    ],
  },
];

export function PickerPage() {
  const [copiedKw, setCopiedKw] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [openCat, setOpenCat] = useState<string | null>("毛绒玩具");

  const copyKw = async (kw: string) => {
    await navigator.clipboard.writeText(kw);
    setCopiedKw(kw);
    setTimeout(() => setCopiedKw(null), 2000);
  };

  const searchOn1688 = (kw: string) => {
    window.open(`https://search.1688.com/search/product.do?SearchText=${encodeURIComponent(kw)}&sortType=6`, "_blank");
  };

  const filtered = search.trim()
    ? CATEGORIES.map(cat => ({
        ...cat,
        items: cat.items.filter(k => k.label.includes(search) || k.kw.includes(search)),
      })).filter(cat => cat.items.length > 0)
    : CATEGORIES;

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-4">
        <h2 className="text-lg font-bold text-gray-900 mb-1">选品参考</h2>
        <p className="text-sm text-gray-500 mb-3">29个品类，300+关键词，点「复制」或「搜」直达1688</p>
        <input
          type="text"
          value={search}
          onChange={e => { setSearch(e.target.value); if(e.target.value) setOpenCat(null); }}
          placeholder="搜索品类或关键词..."
          className="w-full border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-400"
        />
      </div>

      <div className="space-y-2">
        {filtered.map((cat) => {
          const isOpen = openCat === cat.name || !!search.trim();
          return (
            <div key={cat.name} className={`border rounded-xl overflow-hidden ${isOpen ? "border-pink-200 bg-pink-50" : "border-gray-200 bg-white"}`}>
              <button
                onClick={() => setOpenCat(isOpen && !search ? null : cat.name)}
                className="w-full flex items-center gap-2 px-4 py-2.5 text-left hover:bg-gray-50 transition-colors"
              >
                <span className="text-base">{cat.emoji}</span>
                <span className="font-semibold text-gray-900 text-sm">{cat.name}</span>
                <span className="text-xs px-2 py-0.5 rounded-full ml-1 bg-pink-100 text-pink-600">{cat.items.length}个词</span>
                <span className="ml-auto text-gray-400">{isOpen && !search ? <ChevronDown size={15} /> : <ChevronRight size={15} />}</span>
              </button>
              {isOpen && (
                <div className="bg-white border-t border-gray-100 px-3 py-2.5 flex flex-wrap gap-1.5">
                  {cat.items.map(({ label, kw, hot }) => (
                    <div key={kw} className="flex items-center gap-0.5">
                      <button onClick={() => copyKw(kw)}
                        className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-l-lg border border-gray-200 bg-white hover:bg-gray-50 transition-colors">
                        {hot && <span className="text-[10px]">🔥</span>}
                        {copiedKw === kw ? <Check size={10} className="text-green-500" /> : <Copy size={10} className="text-gray-300" />}
                        {label}
                      </button>
                      <button onClick={() => searchOn1688(kw)} title="在1688搜索"
                        className="text-xs px-2 py-1.5 rounded-r-lg text-white bg-pink-500 hover:bg-pink-600 transition-colors">
                        搜
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {copiedKw && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-sm px-4 py-2 rounded-xl shadow-lg flex items-center gap-2 z-50">
          <Check size={14} className="text-green-400" />
          已复制「{copiedKw}」
          <a href="https://www.1688.com" target="_blank" rel="noopener noreferrer"
            className="ml-2 text-blue-300 underline text-xs flex items-center gap-1">
            打开1688 <ExternalLink size={11} />
          </a>
        </div>
      )}
    </div>
  );
}
