#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
E盘开发环境 -> D盘推送纯净环境 一键同步脚本
将 E:\website\Cabinet 的最新代码、manifest、缩略图、伴生 MD 描述文件同步到 D:\website\Cabinet
"""

import shutil
from pathlib import Path

SRC_DIR = Path("E:/website/Cabinet")
DST_DIR = Path("D:/website/Cabinet")

# 需要同步的目录与文件列表
SYNC_ITEMS = [
    "index.html",
    "README.md",
    "CHANGELOG.md",
    "LICENSE",
    ".gitignore",
    "assets",
    "data",
    "thumbs",
    "downloads",
    "tools",
    "demo",
    "vendor",
    "pic",  # 保持 MD 标注与源图同步
]

def sync_dev_to_deploy():
    print("=" * 60)
    print("🚀 开始同步: E盘开发环境 -> D盘推送纯净环境")
    print(f"  源目录 (E: 开发): {SRC_DIR}")
    print(f"  目标目录 (D: 推送): {DST_DIR}")
    print("=" * 60)

    if not SRC_DIR.exists():
        print(f"❌ 错误: E盘源目录不存在: {SRC_DIR}")
        return
    if not DST_DIR.exists():
        print(f"❌ 错误: D盘目标目录不存在: {DST_DIR}")
        return

    total_synced = 0
    for name in SYNC_ITEMS:
        src_path = SRC_DIR / name
        dst_path = DST_DIR / name

        if not src_path.exists():
            continue

        if src_path.is_file():
            dst_path.parent.mkdir(parents=True, exist_ok=True)
            shutil.copy2(src_path, dst_path)
            total_synced += 1
            print(f"  [文件] {name}")
        elif src_path.is_dir():
            for s_file in src_path.rglob("*"):
                if s_file.is_file():
                    rel = s_file.relative_to(SRC_DIR)
                    d_file = DST_DIR / rel
                    d_file.parent.mkdir(parents=True, exist_ok=True)
                    
                    # 仅在目标不存在或源文件较新/尺寸不同时复制
                    need_copy = False
                    if not d_file.exists():
                        need_copy = True
                    else:
                        s_st = s_file.stat()
                        d_st = d_file.stat()
                        if s_st.st_mtime > d_st.st_mtime or s_st.st_size != d_st.st_size:
                            need_copy = True
                    
                    if need_copy:
                        shutil.copy2(s_file, d_file)
                        total_synced += 1
                        print(f"  [更新] {rel}")

    print("=" * 60)
    print(f"✅ 同步完成！共更新/写入 {total_synced} 个文件到 D盘纯净推送环境。")
    print("💡 现在可在 D:\\website\\Cabinet 目录执行 git add / git commit / git push 推送上线。")

if __name__ == "__main__":
    sync_dev_to_deploy()
