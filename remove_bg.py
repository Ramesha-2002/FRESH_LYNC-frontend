import os
from rembg import remove
input_dir = 'public/images/floating'
for filename in os.listdir(input_dir):
    if filename.endswith('.png'):
        input_path = os.path.join(input_dir, filename)
        with open(input_path, 'rb') as i:
            input_data = i.read()
        output_data = remove(input_data)
        with open(input_path, 'wb') as o:
            o.write(output_data)
        print(f'Processed {filename}')
