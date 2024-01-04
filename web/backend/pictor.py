import argparse
from pathlib import Path
from pictor.core.pimage import PImage
import cv2
import timeit


def process_file(file_path):
    file_extension = file_path.suffix.lower()
    
    low, high = 45, 220

    if file_extension in {'.jpg', '.jpeg', '.png'}: 
        start_time = timeit.default_timer()
        
        image = cv2.imread(str(file_path)) 
        PImage.process_frame(image, low, high)
        
        end_time = timeit.default_timer()
        elapsed_time = end_time - start_time
        
        print(f"Time taken: {elapsed_time:.6f} seconds")
    elif file_extension in {'.mp4', '.avi', '.mov'}:
        #video.process_video(file_path)
        print('video')
    else:
        print("Unsupported file type")

def main():
    parser = argparse.ArgumentParser(description="Process image or video files with Pictor.")
    parser.add_argument("file", type=Path, help="Path to the file")

    args = parser.parse_args()
    process_file(args.file)

if __name__ == "__main__":
    main()
