# 生产部署检查清单

## 发布前必检
- 已配置 `DATABASE_URL`
- 已配置 `NEXTAUTH_SECRET`
- 已配置 `APP_URL`
- 已配置 `NEXTAUTH_URL`
- 已配置 `STRIPE_PUBLISHABLE_KEY`
- 已配置 `STRIPE_SECRET_KEY`
- 已配置 `STRIPE_WEBHOOK_SECRET`
- 已配置 `EMAIL_PROVIDER_API_KEY`
- 已配置 `EMAIL_FROM`
- 已配置 `SUPPORT_EMAIL`

## 法律与公开资料
- 已在内容设置中替换所有法律占位字段
- 已确认公司名称、注册地址、联系电话、Business Number 为真实资料
- 已确认 Funding/Contribution Disclosure 文字与真实业务一致
- 未错误宣称慈善税务抵扣资格

## 支付
- 至少启用一个支付网关
- Stripe 生产 Webhook 已指向 `/api/webhooks/stripe`
- Moneris 如启用，已完成真实商户产品确认与官方合规组件接入
- 不在生产模式下使用 Moneris 内部模拟测试流程

## 安全
- HTTPS 已启用
- 环境变量未提交到 Git
- 生产日志不输出完整卡号、CVV、Secret
- 已确认 CSP、X-Frame-Options、Referrer-Policy 等响应头生效
- 管理员账号使用强密码

## 运维
- 已完成数据库备份策略
- 已接入错误监控与应用日志监控
- 已配置部署回滚方式
- 已运行 `npm run check`
- 已运行 `npm run check:readiness`
