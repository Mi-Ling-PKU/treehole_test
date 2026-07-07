# 树洞

一个使用 Next.js + Supabase + Cloudflare Workers 的匿名树洞网站。

## 当前功能

- 账号注册、登录、退出，公开页面不显示邮箱。
- 登录后浏览广场、发布树洞、回复树洞、回复指定评论。
- 发布树洞后，发布者会自动关注自己的树洞。
- 每条树洞内独立分配匿名名称：洞主显示为“洞主”，其他参与者按首次回复顺序显示 Alice、Bob、Carol 等；超过 26 人后使用 Angry Alice、Angry Bob 等旧树洞风格名称。
- 关注列表、站内消息、回复提醒、全文搜索。
- 举报内容、管理员审核、折叠、恢复、删除、临时限制账号。
- 黑夜/白天模式切换，默认黑夜模式。

## 本地运行

1. 安装依赖：

```bash
npm install
```

2. 创建 Supabase 项目。
3. 打开 Supabase SQL Editor，执行 `supabase/schema.sql` 中的全部 SQL。

注意：这个 SQL 会删除并重建本项目的业务表，适合当前重构后的数据结构。

4. 复制 `.env.example` 为 `.env.local`，填入 Supabase 项目的 URL 和 Anon Key。
5. 启动开发服务器：

```bash
npm run dev
```

访问 `http://localhost:3000`。

## 设置登录

在 Supabase 控制台打开 Authentication > Providers，启用 Email。当前前端注册成功后显示“注册成功！”。如果你重新打开邮箱验证，Supabase 会要求用户先完成邮件验证再登录。

## 设置管理员

1. 先在网站注册一个账号。
2. 到 Supabase 控制台 Authentication > Users，复制这个用户的 ID。
3. 到 SQL Editor 执行：

```sql
insert into public.admins (user_id)
values ('替换成你的用户ID');
```

之后这个账号可以看到导航里的“审核”入口，并访问 `/admin`。

## 部署到 Cloudflare Workers

1. 确认 Supabase 已执行最新 `supabase/schema.sql`。
2. 本地登录 Wrangler：

```bash
npx wrangler login
```

3. 部署：

```bash
npm run deploy
```

4. 在 Cloudflare 的 Variables and secrets 中添加：

```text
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
```

5. 部署后，在 Supabase Authentication > URL Configuration 中把 Cloudflare 网址加入 Site URL 和 Redirect URLs，例如：

```text
https://你的项目名.你的账号.workers.dev
https://你的项目名.你的账号.workers.dev/**
```

## 常用命令

```bash
npm run lint
npm run build
npm run preview
npm run deploy
```

`preview` 会用 Cloudflare Workers 运行时本地预览，`deploy` 会构建并发布到 Cloudflare。
