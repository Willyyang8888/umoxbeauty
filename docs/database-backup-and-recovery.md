# 数据库备份与恢复说明

## 目标
- 保证交易、退款、Webhook 事件、审计日志和内容设置可恢复
- 将备份策略纳入常规运维，而不是发布后临时处理

## 建议策略
- 使用托管 PostgreSQL 的自动每日备份
- 保留至少 7 到 30 天的时间点恢复窗口
- 每次重大发布前手动创建一次备份快照
- 每周至少验证一次恢复流程

## 重点表
- `SupportTransaction`
- `PaymentAttempt`
- `Refund`
- `WebhookEvent`
- `ReceiptDispatch`
- `GatewayConfiguration`
- `SiteContentSettings`
- `AuditLog`
- `AdminUser`

## 恢复演练
1. 在隔离环境恢复最近备份
2. 验证最近交易、退款和内容设置是否可读取
3. 验证管理员登录是否正常
4. 验证 Webhook 幂等约束与唯一索引仍然有效
5. 记录恢复时间和问题点

## 发布前建议
- 在执行数据库迁移前创建备份
- 记录当前 Prisma 迁移版本
- 如迁移涉及支付状态字段或唯一索引，优先在 staging 验证
