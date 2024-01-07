import cv2
import os
import numpy as np
from pimage import PImage
from flask import Flask

app = Flask(__name__)

class PVideo: 
    
    @classmethod
    def _create_video_from_frames(cls, output_path, frames, fps=24): 
        height, width, _ = frames[0].shape
        fourcc = cv2.VideoWriter_fourcc(*'h264')  
        video_writer = cv2.VideoWriter(output_path, fourcc, fps, (width, height)) 
    
        for frame in frames:  
            #convert to BGR format
            frame_bgr = cv2.cvtColor(frame, cv2.COLOR_RGBA2RGB)  
            print(f"Frame shape: {frame_bgr.shape}") 
            video_writer.write(frame_bgr)
        
        video_writer.release() 
        return output_path
    
    @classmethod
    def create_video(cls, frame, img_filter, low, high, direction, inFilter, blend, bleed, interval_type, starburst, num_frames): 

        
        
        output_dir = 'generated'
        output_file_name = 'processed_video.mp4'
        output_path = os.path.join(app.root_path, output_dir, output_file_name)
        start_frame = np.copy(frame)
        start_direction = direction

        # return cls.create_test_video(12, output_file_name, 24)
        
        frames = []
        #for i in range(num_frames): 
        i = 0
        while True:
            i += 1
            frame = PImage.process_frame(frame, img_filter, low, high, start_direction, inFilter, blend, bleed, interval_type, starburst) 
            frames.append(frame)  

            # if low >= 37:
            low = max(-1,low-1) 
            # high = min(256, high+1)
            # if i > 65:
            #     low = 27
            #     high = 46
            # if i > 140:
            #     low = 0
            
            print(f'frame {i+1}/{num_frames} low:{low} high:{high} direction:{start_direction}') 
            
            if low == -1 and high == 256 or i > num_frames:
                break
            
        return cls._create_video_from_frames(output_path, frames)