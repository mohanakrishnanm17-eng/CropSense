import os

# Path to the dataset folder (adjust if your structure differs)
data_dir = os.path.join("data", "archive", "PlantVillage")

if not os.path.exists(data_dir):
    print(f"Path not found: {data_dir}")
    print("Contents of data/archive:")
    print(os.listdir(os.path.join("data", "archive")))
else:
    categories = os.listdir(data_dir)
    print(f"Found {len(categories)} categories:\n")
    total_images = 0
    for category in categories:
        category_path = os.path.join(data_dir, category)
        if os.path.isdir(category_path):
            count = len(os.listdir(category_path))
            total_images += count
            print(f"{category}: {count} images")
    print(f"\nTotal images: {total_images}")