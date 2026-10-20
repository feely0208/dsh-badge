#!/usr/bin/env python3
"""
生成 deepwhale 徽章 PNG（726×120，121×20 使用）。

关键教训（2026-10-20，改了 6 轮才成）：
1) **源文件必须完整**：`whale.svg` / `whale-clean.png` 底部被裁过（viewBox/SVG 导出时切掉），
   鱼鳍下半截和白色鳍尖根本不在图里 —— 用它无论怎么处理都缺一块。
   正确源：`whale-logo-full.png`（1390×974，带透明通道）。
2) **不要沿外轮廓切割**：白色剪影要整体保留；要做的是把原图里**本来就是白色**的区域
   （肚皮 / 眼睛 / 鳍与身体之间的白缝）从剪影里镂空，鱼鳍自然就浮出来了。
3) **排除底部水印**：whale-logo-full.png 底部有淡色 DeepWhale 小字，按连通块位置/面积过滤。

依赖：Pillow、numpy、scipy
用法：python3 tools/make-badge.py [--src 原图路径] [--out 输出路径]
"""
import argparse
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFont
from scipy import ndimage

SIDE = '#16202e'   # 左段底色
BRAND = '#005A8C'  # 右段品牌蓝
RADIUS = 18        # 121 宽下 3px 圆角 ×6
W, H = 726, 120

def build_silhouette(src: Path) -> Image.Image:
    im = Image.open(src).convert('RGBA')
    a = np.array(im).astype(int)
    alpha = a[:, :, 3]
    M = alpha > 10

    # 去掉底部水印小字（位置贴底 + 面积小的连通块）
    lab, n = ndimage.label(M)
    keep = np.zeros_like(M)
    hgt = M.shape[0]
    for i in range(1, n + 1):
        ys, _ = np.where(lab == i)
        if len(ys) < 20:
            continue
        if ys.mean() > hgt * 0.93 and len(ys) < 8000:
            continue
        keep |= lab == i
    M = keep

    # 原图里的"白色区域"= 要镂空的部分（肚皮 / 眼睛 / 鳍边的白缝）
    r, g, b = a[:, :, 0], a[:, :, 1], a[:, :, 2]
    white = (r > 235) & (g > 235) & (b > 235) & M
    wl, wn = ndimage.label(white)
    holes = np.zeros_like(M)
    for i in range(1, wn + 1):
        reg = wl == i
        if reg.sum() >= 60:
            holes |= reg

    sil = ndimage.binary_opening(M & ~holes, iterations=1)
    ys, xs = np.where(sil)
    box = (xs.min(), ys.min(), xs.max() + 1, ys.max() + 1)
    m = Image.fromarray((sil * 255).astype(np.uint8), 'L').crop(box)
    whale = Image.new('RGBA', m.size, (255, 255, 255, 255))
    whale.putalpha(m)
    return whale

def build_badge(whale: Image.Image, font_dir='/System/Library/Fonts/Supplemental') -> Image.Image:
    tw = 118
    th = int(whale.height * tw / whale.width)
    content = Image.new('RGB', (W, H), SIDE)
    d = ImageDraw.Draw(content)
    d.rectangle([552, 0, W, H], fill=BRAND)
    whale = whale.resize((tw, th), Image.LANCZOS)
    content.paste(whale, (20, (H - th) // 2), whale)

    f_label = ImageFont.truetype(f'{font_dir}/Arial.ttf', 68)
    f_brand = ImageFont.truetype(f'{font_dir}/Arial.ttf', 64)
    d.text((152, H - 28), 'powered by', font=f_label, fill='#ffffff', anchor='ls')
    bw = d.textbbox((0, 0), 'dwh', font=f_brand)
    d.text((552 + (174 - (bw[2] - bw[0])) / 2, H - 38), 'dwh', font=f_brand,
           fill='#ffffff', anchor='ls')

    mask = Image.new('L', (W, H), 0)
    ImageDraw.Draw(mask).rounded_rectangle([0, 0, W - 1, H - 1], radius=RADIUS, fill=255)
    out = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    out.paste(content, (0, 0), mask)
    return out

if __name__ == '__main__':
    ap = argparse.ArgumentParser()
    ap.add_argument('--src', default='/Users/mac/DeepSeek Harness/site-migration/deepwhale.org.cn/assets/whale-logo-full.png')
    ap.add_argument('--out', default='assets/deepwhale-badge.png')
    args = ap.parse_args()
    whale = build_silhouette(Path(args.src))
    badge = build_badge(whale)
    Path(args.out).parent.mkdir(parents=True, exist_ok=True)
    badge.save(args.out)
    print('saved', args.out, badge.size)
