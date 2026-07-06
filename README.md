# 树洞 MVP

一个使用 Next.js + Supabase + Vercel 的匿名树洞网站。

## 本地运行

1. 安装依赖：

```bash
npm install
```

2. 创建 Supabase 项目。
3. 打开 Supabase SQL Editor，执行 `supabase/schema.sql` 中的全部 SQL。
4. 复制 `.env.example` 为 `.env.local`，填入 Supabase 项目的 URL 和 Anon Key。
5. 启动开发服务器：

```bash
npm run dev
```

访问 `http://localhost:3000`。

## 设置登录

在 Supabase 控制台打开 Authentication：

- Providers 中启用 Email。
- 默认使用 Supabase 的邮箱验证；注册后需要先打开邮件完成验证，再回到网站登录。

## 设置管理员

1. 先在网站注册并登录一个账号。
2. 到 Supabase 控制台 Authentication > Users，复制这个用户的 ID。
3. 到 SQL Editor 执行：

```sql
insert into public.admins (user_id)
values ('替换成你的用户ID');
```

之后这个账号可以访问 `/admin` 处理举报。

## 部署到 GitHub + Vercel

1. 初始化 Git 并推送到 GitHub：

```bash
git init
git add .
git commit -m "Initial treehole MVP"
git branch -M main
git remote add origin 你的GitHub仓库地址
git push -u origin main
```

2. 在 Vercel 新建项目，选择这个 GitHub 仓库。
3. 在 Vercel Project Settings > Environment Variables 添加：

```text
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
```

4. 部署后，在 Supabase Authentication > URL Configuration 中把 Vercel 域名加入 Site URL 和 Redirect URLs。

## 当前功能

- 未登录用户可以浏览树洞和回复。
- 登录用户可以发帖、评论、回复指定评论、收藏、举报。
- 每个树洞内会用匿名名称区分回复者：洞主显示为 OP，其他用户按首次回复顺序显示为 Alice、Bob 等，超过 26 人后显示为 Mr.27、Mr.28。
- `/favorites` 显示当前账号收藏的帖子。
- `/admin` 支持管理员查看举报、隐藏、恢复、软删除内容。

## 注意

公开页面不会显示邮箱或用户 ID。管理员后台会显示内部用户 ID，用于处理滥用和重复违规。
