export function getFriendlyAuthMessage(error: unknown) {
  if (!(error instanceof Error)) {
    return "暂时无法完成操作，请稍后再试。";
  }

  const message = error.message.toLowerCase();

  if (message.includes("email rate limit") || message.includes("rate limit")) {
    return "尝试次数有点多，请稍后再试。";
  }

  if (message.includes("invalid login credentials")) {
    return "邮箱或密码不正确。";
  }

  if (message.includes("user already registered") || message.includes("already registered")) {
    return "这个邮箱已经注册过，可以直接登录。";
  }

  if (message.includes("password") && message.includes("six")) {
    return "密码至少需要 6 位。";
  }

  if (message.includes("email")) {
    return "请检查邮箱地址是否填写正确。";
  }

  return "暂时无法完成操作，请稍后再试。";
}
