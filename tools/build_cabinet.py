#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Cabinet 构建与元数据同步工具 (Cabinet Build & Manifest Generator)
功能：
1. 扫描 pic/ 目录下的所有伴生 .md 文件；
2. 过滤 status: done 的作品；
3. 自动生成 640px 缩略图 (thumbs/*.webp)；
4. 自动生成高保真下载原图 (downloads/*.webp)；
5. 自动编译并同步更新 data/manifest.json 与 data/manifest.js。
"""

import sys
import os
import re
import math
import json
from pathlib import Path
from PIL import Image

# 确保 Windows 终端支持 UTF-8 打印输出
if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
        sys.stderr.reconfigure(encoding="utf-8")
    except Exception:
        pass

# 禁用 Pillow 大图解压缩炸弹限制 (支持数亿像素空间图)
Image.MAX_IMAGE_PIXELS = None

ROOT_DIR = Path(__file__).resolve().parent.parent
PIC_DIR = ROOT_DIR / "pic"
THUMBS_DIR = ROOT_DIR / "thumbs"
DOWNLOADS_DIR = ROOT_DIR / "downloads"
DATA_DIR = ROOT_DIR / "data"
MANIFEST_JSON = DATA_DIR / "manifest.json"
MANIFEST_JS = DATA_DIR / "manifest.js"

SUPPORTED_EXTS = [".tif", ".tiff", ".jpg", ".jpeg", ".jfif", ".png", ".webp"]


def parse_frontmatter(content: str):
    """简易极速 YAML Frontmatter 与正文解析器 (无需额外安装 pyyaml)"""
    meta = {}
    body = ""
    match = re.match(r"^---\s*\n(.*?)\n---\s*\n(.*)$", content, re.DOTALL)
    if not match:
        return meta, content.strip()

    yaml_block, body = match.groups()
    current_key = None
    is_list = False

    for line in yaml_block.splitlines():
        line = line.rstrip()
        if not line or line.startswith("#"):
            continue

        # 匹配列表项: '  - item'
        list_match = re.match(r"^\s*-\s+(.*)$", line)
        if list_match and current_key:
            val = list_match.group(1).strip()
            # 移除引号
            val = val.strip("'\"")
            if not is_list:
                meta[current_key] = []
                is_list = True
            meta[current_key].append(val)
            continue

        # 匹配键值对: 'key: value'
        kv_match = re.match(r"^([a-zA-Z0-9_-]+):\s*(.*)$", line)
        if kv_match:
            current_key = kv_match.group(1).strip()
            val = kv_match.group(2).strip()
            is_list = False

            if val == "":
                # 可能是后续列表
                meta[current_key] = []
                is_list = True
            elif val.startswith("[") and val.endswith("]"):
                # 内联列表 [a, b, c]
                items = [x.strip().strip("'\"") for x in val[1:-1].split(",") if x.strip()]
                meta[current_key] = items
            elif val.lower() in ("true", "yes"):
                meta[current_key] = True
            elif val.lower() in ("false", "no"):
                meta[current_key] = False
            else:
                meta[current_key] = val.strip("'\"")

    return meta, body.strip()


def format_file_size(size_bytes: int) -> str:
    """人类可读文件大小"""
    if size_bytes < 1024 * 1024:
        return f"{size_bytes / 1024:.1f} KB"
    return f"{size_bytes / (1024 * 1024):.1f} MB"


def find_matched_image(md_path: Path):
    """寻找与 md 同名的图片母版"""
    stem = md_path.stem
    parent = md_path.parent
    for ext in SUPPORTED_EXTS:
        candidate = parent / f"{stem}{ext}"
        if candidate.exists():
            return candidate
    return None


def generate_thumbnail(img_path: Path, thumb_path: Path, max_size=640):
    """生成 640px 极轻量列表 WebP 缩略图"""
    if thumb_path.exists():
        return
    thumb_path.parent.mkdir(parents=True, exist_ok=True)
    with Image.open(img_path) as im:
        im = im.convert("RGB")
        im.thumbnail((max_size, max_size), Image.Resampling.LANCZOS)
        im.save(thumb_path, "WEBP", quality=85, method=6)
        print(f"  [生成缩略图] -> {thumb_path.name}")


def generate_download_webp(img_path: Path, download_path: Path, quality=88):
    """生成全尺寸高保真 WebP 下载大图 (较 TIF/JPG 瘦身 80%~90%)"""
    if download_path.exists():
        return
    download_path.parent.mkdir(parents=True, exist_ok=True)
    print(f"  [转换下载大图] 正在压缩高保真 WebP: {download_path.name} ...")
    with Image.open(img_path) as im:
        im = im.convert("RGB")
        im.save(download_path, "WEBP", quality=quality, method=4)
        size_str = format_file_size(download_path.stat().st_size)
        print(f"  [转换完成] -> {download_path.name} ({size_str})")


def build_cabinet():
    print("=" * 60)
    print("🚀 开始构建 Cabinet · 珍奇柜空间图志画廊")
    print("=" * 60)

    THUMBS_DIR.mkdir(parents=True, exist_ok=True)
    DOWNLOADS_DIR.mkdir(parents=True, exist_ok=True)
    DATA_DIR.mkdir(parents=True, exist_ok=True)

    md_files = list(PIC_DIR.rglob("*.md"))
    print(f"📁 扫描到 {len(md_files)} 个 .md 描述文件\n")

    manifest_items = []

    for md_path in md_files:
        # 忽略以 _ 或 . 开头的模板/草稿/隐藏说明文件 (例如 _template.md)
        if md_path.name.startswith(("_", ".")):
            continue

        try:
            with open(md_path, "r", encoding="utf-8") as f:
                content = f.read()
        except Exception as e:
            print(f"❌ 读取失败 {md_path}: {e}")
            continue

        meta, description = parse_frontmatter(content)
        status = meta.get("status", "draft")
        title = meta.get("title", md_path.stem)

        # 仅处理 status 为 done / published / modified 的作品
        if status not in ("done", "published", "modified", "ready"):
            print(f"⏸️ [跳过草稿] {title} (status: {status})")
            continue

        img_path = find_matched_image(md_path)
        if not img_path:
            print(f"⚠️ [缺少图片] 未找到 {md_path.name} 的对应大图")
            continue

        item_id = meta.get("id", re.sub(r"[^a-zA-Z0-9_-]", "_", md_path.stem.lower()))
        print(f"✨ [处理作品] {title} (ID: {item_id})")

        # 读取大图尺寸
        try:
            with Image.open(img_path) as im:
                w, h = im.size
        except Exception as e:
            print(f"  ❌ 无法读取图片尺寸 {img_path}: {e}")
            continue

        aspect_ratio = round(w / h, 4)
        max_level = math.ceil(math.log2(max(w, h)))

        # 1. 自动生成缩略图
        thumb_file = THUMBS_DIR / f"{item_id}.webp"
        generate_thumbnail(img_path, thumb_file, max_size=640)

        # 2. 自动生成高保真下载图 (使用原图真实名称，与原图一一对应)
        download_meta = {}
        if meta.get("download", True):
            dl_filename = f"{img_path.stem}.webp"
            dl_file = DOWNLOADS_DIR / dl_filename
            generate_download_webp(img_path, dl_file)
            if dl_file.exists():
                download_meta = {
                    "url": f"downloads/{dl_filename}",
                    "size": format_file_size(dl_file.stat().st_size),
                    "filename": dl_filename
                }

        # 3. 组装条目元数据
        item = {
            "id": item_id,
            "title": title,
            "filename": img_path.name,
            "category": meta.get("category", "gis"),
            "categoryName": meta.get("categoryName", "网上GIS图片分享"),
            "subCategory": meta.get("subCategory", "标准地图"),
            "region": meta.get("region", ""),
            "source": meta.get("source", ""),
            "scale": meta.get("scale", ""),
            "reviewNumber": meta.get("reviewNumber", ""),
            "description": description or meta.get("description", ""),
            "author": meta.get("source") or meta.get("author", "网络精选"),
            "status": status,
            "tags": meta.get("tags", []),
            "width": w,
            "height": h,
            "aspectRatio": aspect_ratio,
            "thumb": f"thumbs/{item_id}.webp",
            "tileUrl": f"tiles/{item_id}_files/",
            "maxLevel": max_level,
            "tileSize": 256,
            "overlap": 0,
            "format": "webp",
            "download": download_meta,
            "dzi": {
                "Image": {
                    "xmlns": "http://schemas.microsoft.com/deepzoom/2008",
                    "Url": f"tiles/{item_id}_files/",
                    "Format": "webp",
                    "Overlap": "0",
                    "TileSize": "256",
                    "Size": {
                        "Width": w,
                        "Height": h
                    }
                }
            }
        }
        manifest_items.append(item)

    # 4. 写入 manifest.json
    with open(MANIFEST_JSON, "w", encoding="utf-8") as f:
        json.dump(manifest_items, f, ensure_ascii=False, indent=2)
    print(f"\n✅ 已生成: {MANIFEST_JSON.relative_to(ROOT_DIR)} (收录 {len(manifest_items)} 幅正式作品)")

    # 5. 写入 manifest.js (离线降级垫片)
    with open(MANIFEST_JS, "w", encoding="utf-8") as f:
        f.write("window.GALLERY_MANIFEST = ")
        json.dump(manifest_items, f, ensure_ascii=False, indent=2)
        f.write(";\n")
    print(f"✅ 已同步: {MANIFEST_JS.relative_to(ROOT_DIR)}")
    print("=" * 60)
    print("🎉 构建全部完成！可直接双击运行网页预览。")
    print("=" * 60)


if __name__ == "__main__":
    build_cabinet()
