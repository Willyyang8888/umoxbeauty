# 单主体项目支持/捐款网站

这是一个基于 `Next.js + TypeScript + App Router + Tailwind CSS + Prisma + PostgreSQL` 的单主体项目支持网站模板。网站由单一加拿大公司直接运营，第一版以 `Stripe` 为主支付通道，并预留 `Moneris` 备用通道适配器。

## 已完成范围
- Phase 1
- Next.js 项目初始化
- Prisma 数据模型与首个迁移
- 首页、About、Contact、Support、法律页面
- 管理员登录页、后台布局、Dashboard、Transactions、Refunds、Gateway Settings 基础页
- `.env.example`
- 基础安全头、速率限制、输入验证
- Phase 2
- `PaymentGateway` 抽象层
- `StripeGateway`
- `MonerisGateway` 适配器骨架与 `BLOCKED_BY_MONERIS_ACCOUNT_CONFIGURATION`
- Stripe Checkout API
- Stripe Webhook 验签与幂等处理
- 成功、处理中、失败页面
- 收据幂等派发记录
- 单元测试与基础 E2E 冒烟测试文件
- Phase 3
- 交易筛选、交易详情页、CSV 导出
- 退款后台表单与服务端金额校验
- 网关设置保存
- 内容设置保存
- 审计日志列表与关键管理动作记录
- Phase 4
- Moneris 内部测试模式通道
- 支持页可手动选择 Stripe 或 Moneris
- Moneris 模拟托管结账页与结果回写
- Moneris 相关 Mock 测试
- Phase 5
- 上线准备状态页与发布门禁
- 法律资料完整性生产环境拦截
- 发布前检查脚本
- 备份、监控、部署清单文档

## 技术栈
- `Next.js`
- `React`
- `TypeScript`
- `Tailwind CSS`
- `PostgreSQL`
- `Prisma`
- `Auth.js`
- `Stripe`
- `Vitest`
- `Playwright`

## 目录结构
```text
.
├─ .trae/documents/
├─ prisma/
├─ src/
│  ├─ app/
│  ├─ components/
│  ├─ features/
│  ├─ lib/
│  ├─ server/
│  ├─ tests/
│  └─ types/
├─ .env.example
├─ playwright.config.ts
├─ tailwind.config.ts
└─ vitest.config.ts
```

## 环境变量
复制 `.env.example` 到 `.env.local`，并至少配置以下项：

```bash
DATABASE_URL=
NEXTAUTH_SECRET=
NEXTAUTH_URL=http://localhost:3000

ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=
ADMIN_NAME=Site Admin

STRIPE_PUBLISHABLE_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=

MONERIS_STORE_ID=
MONERIS_API_TOKEN=
MONERIS_ENVIRONMENT=test

EMAIL_PROVIDER_API_KEY=
EMAIL_FROM=
SUPPORT_EMAIL=support@example.com

APP_URL=http://localhost:3000
DEFAULT_CURRENCY=CAD
RECEIPT_SENDER_NAME=Support Team
```

## 本地开发
1. 安装依赖

```bash
npm install
```

2. 生成 Prisma Client

```bash
npm run db:generate
```

3. 执行数据库迁移

```bash
npx prisma migrate deploy
```

4. 初始化默认数据与管理员账户

```bash
npm run db:seed
```

5. 启动开发环境

```bash
npm run dev
```

## 数据库说明
- Prisma Schema 位于 `prisma/schema.prisma`
- 初始迁移位于 `prisma/migrations/0001_init/migration.sql`
- 默认种子会创建：
- `Stripe` 网关配置
- `Moneris` 网关占位配置
- 默认站点内容
- 可选管理员账号

## Stripe 测试步骤
1. 在 Stripe Dashboard 创建测试模式 API Key。
2. 将 `STRIPE_PUBLISHABLE_KEY`、`STRIPE_SECRET_KEY` 写入 `.env.local`。
3. 启动本地服务：

```bash
npm run dev
```

4. 使用 Stripe CLI 转发 Webhook：

```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

5. 将 Stripe CLI 返回的签名密钥填入 `STRIPE_WEBHOOK_SECRET`。
6. 在 `/support` 页面输入测试资料并提交。
7. 使用 Stripe 测试卡：

```text
Card number: 4242 4242 4242 4242
Expiry: any future date
CVC: any 3 digits
Postal code: any value
```

8. 付款成功后检查：
- `/support/[reference]/processing`
- `/support/[reference]/success`
- `WebhookEvent` 表
- `ReceiptDispatch` 表
- `/admin/transactions`

## Moneris 测试步骤
- 当前实现包括内部测试模式通道、模拟托管结账页和结果回写。
- 真实生产接入状态：
- `BLOCKED_BY_MONERIS_ACCOUNT_CONFIGURATION`

### 当前可执行的 Moneris 测试流
1. 在后台启用 `Moneris`，并将环境设为 `test`
2. 打开 `/support?gateway=MONERIS`
3. 提交支持信息
4. 系统将跳转到内部模拟的 Moneris 托管结账页
5. 点击：
- `Simulate success`
- `Simulate failure`
- `Simulate cancel`
6. 系统会把结果写回数据库，并跳转到对应状态页

说明：
- 该流程仅用于开发和测试，不代表真实 Moneris 官方生产接口
- 真正的 Hosted Tokenization / Hosted Checkout 仍需商户产品确认后接入

开始真实接入前，请先提供：
- Moneris `Store ID`
- Moneris `API Token`
- 账户所支持的官方产品类型
- Hosted Tokenization / Hosted Checkout / 其他 PCI 合规组件确认
- 测试环境与生产环境文档

在缺少上述信息前，本项目不会猜测生产 API endpoint。

## 管理员使用说明
1. 在 `.env.local` 中配置：
- `ADMIN_EMAIL`
- `ADMIN_PASSWORD`
- `NEXTAUTH_SECRET`

2. 运行：

```bash
npm run db:seed
```

3. 打开 `/admin/login` 使用管理员账号登录。
4. 当前后台支持：
- 查看仪表盘概览
- 按状态、网关、邮箱、金额、日期筛选交易
- 查看交易详情、Webhook 记录与退款记录
- 导出交易 CSV
- 发起退款并记录审计日志
- 保存网关设置
- 保存内容设置
- 查看审计日志

## 质量检查
运行以下命令：

```bash
npm run lint
npm run typecheck
npm run test
npm run check:readiness
```

E2E 测试：

```bash
npm run test:e2e
```

## 部署说明
### Vercel / Node 环境
- 部署前配置所有环境变量
- 绑定 PostgreSQL 托管数据库
- 配置生产域名与 HTTPS
- 在 Stripe Dashboard 中将生产 Webhook 指向：
- `/api/webhooks/stripe`

### 生产部署清单
- 已配置生产 `DATABASE_URL`
- 已配置 `NEXTAUTH_SECRET`
- 已配置 `APP_URL` 与 `NEXTAUTH_URL`
- 已配置 Stripe 生产密钥
- 已配置 Stripe 生产 Webhook Secret
- 已配置支持邮箱与收据发件人
- 已完成公司法律资料录入
- 已确认法律页面不含关键占位字段
- 已完成数据库备份策略
- 已完成日志与错误监控
- 已运行后台 `Release Readiness` 页面检查
- 已运行命令行 `npm run check:readiness`

## 运维文档
- `docs/production-deployment-checklist.md`
- `docs/database-backup-and-recovery.md`
- `docs/logging-and-monitoring.md`

## 上线检查清单
- 法律页面中的 `[LEGAL_COMPANY_NAME]` 等占位字段已全部替换
- 站点未错误宣称慈善税务抵扣资格
- 生产支付仅通过 Stripe/Moneris 合规托管卡组件
- Webhook 验签通过
- 收据不会因重复 Webhook 重复发送
- 后台账号使用强密码
- 环境变量未提交到 Git
- 日志不记录完整卡号与 CVV

## 尚未完成或依赖外部审核的事项
- Moneris 真实支付与 Webhook 接入
- Moneris 官方 Hosted Tokenization / Hosted Checkout 最终接入
- 后台完整退款工作流 UI
- 内容设置更细粒度的媒体与邮件模板 CRUD
- 审计日志导出
- 生产级分布式速率限制
- 邮件服务真实投递
- 生产公司资料与法律审核
- 更完整的 Playwright 支付流 E2E

## 注意事项
- 默认不宣称付款具备加拿大慈善抵税资格
- 默认只启用 `CAD`
- 默认只接收信用卡
- 不保存完整卡号和 `CVV`
- 支付成功以 Webhook 为准，而非前端跳转
