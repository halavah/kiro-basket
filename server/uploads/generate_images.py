import os
import subprocess
import time
import random
from urllib.parse import quote

# Define products with fallback prompts
# Strategy: Try specific visual description -> Try Name+Category -> Try Name only
products = [
    # Fruit (1-15)
    (1, ['red fuji apple fruit', 'fuji apple', 'apple']),
    (2, ['golden delicious apple fruit', 'yellow apple', 'apple']),
    (3, ['gala apple fruit', 'apple fruit', 'apple']),
    (4, ['green granny smith apple', 'green apple', 'apple']),
    (5, ['yellow banana bunch', 'banana fruit', 'banana']),
    (6, ['orange fruit citrus', 'orange fruit', 'orange']),
    (7, ['kiwi fruit slice', 'kiwi fruit', 'kiwi']),
    (8, ['purple grapes bunch', 'grape fruit', 'grape']),
    (9, ['red strawberry fruit', 'strawberry', 'fruit']),
    (10, ['watermelon slice fruit', 'watermelon', 'melon']),
    (11, ['ripe mango fruit', 'mango', 'fruit']),
    (12, ['asian pear fruit', 'pear', 'fruit']),
    (13, ['pomelo fruit citrus', 'pomelo', 'fruit']),
    (14, ['lychee fruit', 'litchi', 'fruit']),
    (15, ['red cherry fruit', 'cherries', 'cherry']),

    # Vegetable (16-30)
    (16, ['shanghai bok choy vegetable', 'bok choy', 'vegetable']),
    (17, ['spinach vegetable', 'spinach leaves', 'vegetable']),
    (18, ['green lettuce vegetable', 'lettuce', 'vegetable']),
    (19, ['green cabbage vegetable', 'cabbage', 'vegetable']),
    (20, ['broccoli vegetable', 'green broccoli', 'vegetable']),
    (21, ['cauliflower vegetable', 'white cauliflower', 'vegetable']),
    (22, ['purple eggplant vegetable', 'eggplant', 'vegetable']),
    (23, ['red tomato vegetable', 'tomato', 'vegetable']),
    (24, ['green cucumber vegetable', 'cucumber', 'vegetable']),
    (25, ['orange carrot vegetable', 'carrot', 'vegetable']),
    (26, ['potato vegetable', 'potato', 'vegetable']),
    (27, ['red onion vegetable', 'onion', 'vegetable']),
    (28, ['green bell pepper vegetable', 'pepper', 'vegetable']),
    (29, ['celery vegetable', 'celery stick', 'vegetable']),
    (30, ['napa cabbage vegetable', 'chinese cabbage', 'vegetable']),

    # Meat (31-45)
    (31, ['raw pork belly meat', 'pork meat', 'meat']),
    (32, ['raw pork ribs meat', 'pork ribs', 'meat']),
    (33, ['raw lean pork meat', 'pork meat', 'meat']),
    (34, ['raw ground pork meat', 'minced meat', 'meat']),
    (35, ['raw chicken breast meat', 'chicken meat', 'chicken']),
    (36, ['raw chicken drumstick', 'chicken leg', 'chicken']),
    (37, ['raw chicken wing', 'chicken meat', 'chicken']),
    (38, ['raw whole chicken', 'chicken', 'poultry']),
    (39, ['raw beef steak meat', 'beef meat', 'beef']),
    (40, ['raw mutton lamb meat', 'lamb meat', 'meat']),
    (41, ['raw duck meat', 'duck', 'poultry']),
    (42, ['raw pig trotter', 'pork feet', 'meat']),
    (43, ['chicken eggs', 'brown eggs', 'egg']),
    (44, ['salted duck egg', 'duck egg', 'egg']),
    (45, ['quail eggs', 'egg spotted', 'egg']),

    # Seafood (46-55)
    (46, ['raw shrimp seafood', 'shrimp', 'seafood']),
    (47, ['raw white shrimp', 'shrimp', 'seafood']),
    (48, ['frozen shrimp meat', 'shrimp', 'seafood']),
    (49, ['live crayfish', 'crayfish', 'seafood']),
    (50, ['hairy crab seafood', 'crab', 'seafood']),
    (51, ['whole sea bass fish', 'fish', 'seafood']),
    (52, ['ribbon fish seafood', 'long fish', 'fish']),
    (53, ['raw squid seafood', 'squid', 'seafood']),
    (54, ['scallop seafood', 'shellfish', 'seafood']),
    (55, ['raw oysters seafood', 'oyster', 'seafood']),

    # Dairy (56-65)
    (56, ['milk carton', 'milk', 'dairy']),
    (57, ['low fat milk carton', 'milk', 'dairy']),
    (58, ['yogurt cup', 'yogurt', 'dairy']),
    (59, ['soy milk glass', 'soy milk', 'drink']),
    (60, ['yogurt drink', 'yogurt bottle', 'drink']),
    (61, ['cheddar cheese block', 'cheese', 'dairy']),
    (62, ['butter block', 'butter', 'dairy']),
    (63, ['bread loaf', 'bread', 'bakery']),
    (64, ['birthday cake', 'cake', 'dessert']),
    (65, ['butter cookies', 'biscuit', 'cookie'])
]

# Set output directory to 'products' folder relative to this script
current_dir = os.path.dirname(os.path.abspath(__file__))
output_dir = os.path.join(current_dir, 'products')
os.makedirs(output_dir, exist_ok=True)

print(f"Generating {len(products)} images using Pollinations.ai with fallback logic...")

for pid, prompts in products:
    filename = f"product_{pid}.png"
    filepath = os.path.join(output_dir, filename)

    success = False

    for prompt in prompts:
        if success:
            break

        print(f"[{pid}/{len(products)}] Trying prompt: '{prompt}'...")

        # Use prompt directly without random suffix to avoid API blocking
        encoded_prompt = quote(prompt)
        url = f"https://image.pollinations.ai/prompt/{encoded_prompt}"

        cmd = ["curl", "-L", "--retry", "2", "--silent", "--show-error", "-o", filepath, url]

        try:
            subprocess.run(cmd, check=True)

            # Check size
            if os.path.exists(filepath):
                size = os.path.getsize(filepath)
                if size > 1000:
                    print(f"  -> Success! ({size} bytes)")
                    success = True
                else:
                    print(f"  -> Failed (File too small: {size} bytes). Warning: Content might be 'Unauthorized'.")
            else:
                 print("  -> Failed (File not found).")

        except subprocess.CalledProcessError as e:
            print(f"  -> Error: {e}")

        # Delay between attempts
        time.sleep(1)

    if not success:
        print(f"ERROR: Could not generate image for Product {pid} after all attempts.")

print("Process finished.")
