#!/usr/bin/env node
/**
 * deepwhale-badge provider 回归测试
 *
 * 验证的是「插件真的会注册一份可用的 skill」，而不是只看文件存在：
 *   ① apply() 会向 ctx.skills 注册 provider（且只注册一次）；
 *   ② provider.list() 返回 deepwhale-badge 候选，元数据齐全；
 *   ③ provider.get() 读到的正文包含 Shields 地址、121×20 尺寸与免责说明；
 *   ④ 本地 PNG 存在且是 726×120；
 *   ⑤ 组合层 cordis.patch.yml 指向本包名。
 */
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const PKG = path.join(ROOT, '..');
const mod = await import(path.join(PKG, 'lib/index.js'));

let failed = 0;
const ok = (m) => console.log(`  ✅ ${m}`);
const bad = (m) => {
  failed += 1;
  console.log(`  ❌ ${m}`);
};

console.log('\n  deepwhale-badge skill provider');

// ① 注册
{
  const registered = [];
  const ctx = { skills: { registerProvider: (factory) => registered.push(factory()) } };
  mod.apply(ctx);
  if (registered.length === 1) ok('apply() 注册了 1 个 provider');
  else bad(`注册数量不对：${registered.length}`);
  const provider = registered[0];
  if (provider && provider.name === 'deepwhale-badge') ok('provider 名称 = deepwhale-badge');
  else bad('provider 名称不对');

  // ② list
  const list = await provider.list();
  if (list.length === 1 && list[0].name === 'deepwhale-badge') ok('list() 返回 deepwhale-badge 候选');
  else bad('list() 候选不对');
  const cand = list[0];
  if (cand.invocation?.modelInvocable === true && cand.invocation?.userInvocable === true)
    ok('模型与用户都可调用');
  else bad('invocation 标记不对');
  if (typeof cand.description === 'string' && cand.description.includes('深鲸')) ok('description 是给人看的中文说明');
  else bad('description 缺说明');

  // ③ get 正文
  const got = await provider.get(cand);
  const md = got.content;
  if (md.includes('powered_by-dwh') && md.includes('img.shields.io')) ok('正文含 Shields 地址');
  else bad('正文缺 Shields 地址');
  if (md.includes('121×20')) ok('正文写明 121×20 尺寸');
  else bad('正文缺尺寸约定');
  if (md.includes('不代表') && md.includes('背书')) ok('正文含「不代表官方背书」免责');
  else bad('正文缺免责说明');
}

// ④ PNG
{
  const png = path.join(PKG, 'assets/deepwhale-badge.png');
  const buf = fs.readFileSync(png);
  const w = buf.readUInt32BE(16);
  const h = buf.readUInt32BE(20);
  if (w === 726 && h === 120) ok('本地 PNG 726×120');
  else bad(`PNG 尺寸不对：${w}×${h}`);
}

// ⑤ 组合层
{
  const patch = fs.readFileSync(path.join(PKG, 'cordis.patch.yml'), 'utf8');
  const manifest = JSON.parse(fs.readFileSync(path.join(PKG, 'package.json'), 'utf8'));
  if (patch.includes(manifest.name)) ok('cordis.patch.yml 指向本包名');
  else bad('cordis.patch.yml 包名不匹配');
  if (manifest.engines?.dsh === '>=0.1.0-rc.6 <0.3.0') ok('engines.dsh 带上下界');
  else bad(`engines.dsh 不对：${manifest.engines?.dsh}`);
  if (Array.isArray(manifest.files) && manifest.files.includes('assets')) ok('files 包含 assets（否则装完缺正文/图片）');
  else bad('files 漏了 assets');
}

console.log(failed === 0 ? '\n  ✅ 徽章 provider 测试全过\n' : `\n  ❌ 失败 ${failed} 项\n`);
process.exit(failed === 0 ? 0 : 1);
