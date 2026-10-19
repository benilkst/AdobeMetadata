import os
import zipfile

def package_extension():
    dist_dir = 'dist'
    output_zip = 'adobe-stock-ai-metadata-assistant.zip'
    
    if not os.path.exists(dist_dir):
        print(f"Error: {dist_dir} directory not found. Please run 'npm run build' first.")
        return False
        
    print(f"Packaging {dist_dir} into {output_zip}...")
    with zipfile.ZipFile(output_zip, 'w', zipfile.ZIP_DEFLATED) as zipf:
        for root, dirs, files in os.walk(dist_dir):
            for file in files:
                full_path = os.path.join(root, file)
                rel_path = os.path.relpath(full_path, dist_dir)
                zipf.write(full_path, rel_path)
                print(f"  Added: {rel_path}")
                
    size_kb = os.path.getsize(output_zip) / 1024
    print(f"\nSuccessfully generated {output_zip} ({size_kb:.1f} KB)")
    print("This zip file is ready for Chrome Web Store Developer Dashboard or manual distribution.")
    return True

if __name__ == '__main__':
    package_extension()
