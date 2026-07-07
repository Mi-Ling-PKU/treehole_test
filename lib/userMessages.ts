export function getFriendlyAuthMessage(error: unknown) {
  if (!(error instanceof Error)) {
    return "暂时无法完成操作，请稍后再试。";
  }

  const message = error.message.toLowerCase();

  if (message.includes("rate limit")) {
    return "尝试次数有点多，请稍后再试。";
  }

  if (message.includes("invalid login credentials")) {
    return "邮箱或密码不正确。";
  }

  if (message.includes("already registered")) {
    return "这个邮箱已经注册过，可以直接登录。";
  }

  if (message.includes("password")) {
    return "密码至少需要 6 位。";
  }

  if (message.includes("email")) {
    return "请检查邮箱地址是否填写正确。";
  }

  return "暂时无法完成操作，请稍后再试。";
}

export function getFriendlyDataMessage(error: unknown) {
  if (!(error instanceof Error)) {
    return "暂时无法完成操作，请稍后再试。";
  }

  if (error.message.includes("AUTH_REQUIRED")) {
    return "请先登录。";
  }

  if (error.message.includes("BANNED")) {
    return "账号暂时不能发布或回复。";
  }

  if (error.message.includes("NO_PERMISSION")) {
    return "你没有权限进行这个操作。";
  }

  if (error.message.includes("NOT_FOUND")) {
    return "内容不存在或已不可见。";
  }

  if (error.message.includes("violates check constraint")) {
    return "内容长度不符合要求。";
  }

  return error.message || "暂时无法完成操作，请稍后再试。";
}
