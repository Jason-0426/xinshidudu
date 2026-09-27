from PIL import Image
import os

# ============================================================
# 配置
# ============================================================
INPUT_DIR = "public/buildings-raw"
OUTPUT_DIR = "public/buildings"
TARGET_SIZE = 128  # 输出尺寸 128×128

# ============================================================
# 工具函数
# ============================================================
def resize_to_square(img, size):
    """把图片缩放成 size×size，保持宽高比，居中到正方形"""
    w, h = img.size
    scale = size / max(w, h)
    new_w = int(w * scale)
    new_h = int(h * scale)
    img_resized = img.resize((new_w, new_h), Image.LANCZOS)

    canvas = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    offset_x = (size - new_w) // 2
    offset_y = (size - new_h) // 2
    canvas.paste(img_resized, (offset_x, offset_y), img_resized)
    return canvas

def generate_rotations(input_path, output_dir, base_name):
    """生成 2 个方向：原图 + 水平翻转"""
    img = Image.open(input_path).convert("RGBA")
    img = resize_to_square(img, TARGET_SIZE)

    # -0：原图（东南）
    img.save(os.path.join(output_dir, f"{base_name}-0.png"))
    print(f"  ✅ {base_name}-0.png")

    # -1：水平翻转（西南）
    img.transpose(Image.FLIP_LEFT_RIGHT).save(
        os.path.join(output_dir, f"{base_name}-1.png")
    )
    print(f"  ✅ {base_name}-1.png")

# ============================================================
# 主流程
# ============================================================
def main():
    print("=" * 50)
    print("建筑图片 · 自动生成 2 方向（原图 + 水平镜像）")
    print("=" * 50)

    if not os.path.exists(INPUT_DIR):
        print(f"❌ 找不到文件夹：{INPUT_DIR}")
        return

    os.makedirs(OUTPUT_DIR, exist_ok=True)

    # 清理旧的 -2 / -3 文件
    print("\n🧹 清理旧的 -2.png / -3.png：")
    for filename in os.listdir(OUTPUT_DIR):
        if filename.endswith("-2.png") or filename.endswith("-3.png"):
            os.remove(os.path.join(OUTPUT_DIR, filename))
            print(f"  🗑 {filename}")

    # 扫描所有 -0.png
    files = [f for f in os.listdir(INPUT_DIR) if f.endswith("-0.png")]

    if not files:
        print(f"\n❌ {INPUT_DIR} 里没有 -0.png 图片")
        return

    print(f"\n找到 {len(files)} 个建筑：\n")

    for filename in sorted(files):
        base_name = filename.replace("-0.png", "")
        input_path = os.path.join(INPUT_DIR, filename)
        print(f"📦 {base_name}")
        generate_rotations(input_path, OUTPUT_DIR, base_name)
        print()

    print("=" * 50)
    print(f"✅ 完成！{len(files)} 个建筑 × 2 = {len(files) * 2} 张图")
    print(f"输出位置：{OUTPUT_DIR}")
    print("=" * 50)

if __name__ == "__main__":
    main()