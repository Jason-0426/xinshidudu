from PIL import Image
import os

INPUT_DIR = "public/buildings-raw"
OUTPUT_DIR = "public/buildings"
TARGET_SIZE = 128

def crop_to_content(img):
    """裁剪掉透明边距"""
    bbox = img.getbbox()
    if not bbox:
        return img
    return img.crop(bbox)

def pad_to_square_bottom(img, size=128, bottom_pad=0.05):
    """缩放 + 底部对齐到正方形"""
    w, h = img.size
    
    target_h = int(size * (1 - bottom_pad))
    scale = target_h / h
    new_w = int(w * scale)
    new_h = target_h
    
    if new_w > size:
        scale = size / w
        new_w = size
        new_h = int(h * scale)
    
    img_resized = img.resize((new_w, new_h), Image.LANCZOS)
    
    canvas = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    
    x = (size - new_w) // 2
    y = size - new_h - int(size * bottom_pad)
    
    canvas.paste(img_resized, (x, y), img_resized)
    return canvas

def main():
    if not os.path.exists(INPUT_DIR):
        print(f"❌ 找不到：{INPUT_DIR}")
        return
    
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    
    files = [f for f in os.listdir(INPUT_DIR) if f.endswith('-0.png')]
    
    if not files:
        print(f"❌ {INPUT_DIR} 里没有 -0.png")
        return
    
    print(f"找到 {len(files)} 个建筑\n")
    
    for filename in sorted(files):
        base = filename.replace('-0.png', '')
        input_path = os.path.join(INPUT_DIR, filename)
        
        img = Image.open(input_path).convert('RGBA')
        original_size = img.size
        
        img = crop_to_content(img)
        img = pad_to_square_bottom(img, TARGET_SIZE, bottom_pad=0.05)
        
        img.save(os.path.join(OUTPUT_DIR, f'{base}-0.png'))
        
        img.transpose(Image.FLIP_LEFT_RIGHT).save(
            os.path.join(OUTPUT_DIR, f'{base}-1.png')
        )
        
        print(f"✅ {base}: {original_size} → 128×128")
    
    print(f"\n完成！{len(files)} 个建筑 × 2 = {len(files) * 2} 张图")

if __name__ == "__main__":
    main()