/**
 * `deepwhale-badge` skill provider（深鲸桌面署名徽章）。
 *
 * 结构与官方 `@deepseek-ai/dsh-skill-badge` 完全一致：
 *   - 实现只做一件事：往 `ctx.skills` 注册一个 provider；
 *   - skill 正文放在 `assets/deepwhale-badge.md`，资源目录是 `assets/`；
 *   - provider 是不可变的：list() 永远返回同一份候选，get() 读同一份正文。
 *
 * 为什么做成插件而不是本地 skill 目录：装完即可用、随版本更新，用户不用管文件放哪。
 */

import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

// 与官方 dsh-badge 同一个 rank：打包型 skill provider 的标准优先级。
// 运行时从 @deepseek-ai/dsh-skill 取；单元测试（没有运行时依赖）用同一常量兜底。
let BUNDLED_SKILL_RANK = 600;
try {
  ({ BUNDLED_SKILL_RANK } = await import('@deepseek-ai/dsh-skill'));
} catch {
  // 离线环境/单测：保留兜底值
}

const PROVIDER_NAME = 'deepwhale-badge';
const SKILL_BODY_URL = new URL('../assets/deepwhale-badge.md', import.meta.url);
const RESOURCE_BASE = {
  kind: 'directory',
  path: fileURLToPath(new URL('../assets/', import.meta.url)),
};

const CANDIDATE = {
  name: 'deepwhale-badge',
  description:
    '给用深鲸桌面（DeepWhale Desktop）产出的文档、PR、MR 或其他内容添加「powered by deepwhale」署名徽章。当用户提到深鲸徽章、deepwhale 徽章、署名、powered by deepwhale 时使用。',
  invocation: {
    modelInvocable: true,
    userInvocable: true,
  },
  provider: PROVIDER_NAME,
  source: 'bundled',
  resourceBase: RESOURCE_BASE,
  rank: BUNDLED_SKILL_RANK,
  locator: SKILL_BODY_URL,
};

const provider = {
  name: PROVIDER_NAME,
  list: () => Promise.resolve([CANDIDATE]),
  async get(_candidate) {
    return {
      name: CANDIDATE.name,
      description: CANDIDATE.description,
      invocation: CANDIDATE.invocation,
      provider: CANDIDATE.provider,
      source: CANDIDATE.source,
      resourceBase: RESOURCE_BASE,
      content: await readFile(SKILL_BODY_URL, 'utf8'),
    };
  },
};

/** Cordis 插件名 */
export const name = 'deepwhale-badge';

/** 依赖 skills 服务 */
export const inject = ['skills'];

/** 把 provider 注册到 ctx.skills */
export function apply(ctx) {
  ctx.skills.registerProvider(() => provider);
}

export { provider };
