import os 
import cv2   
import traceback 

import numpy as np 
from flask import request, Flask, Response, send_file
from flask_cors import CORS, cross_origin 

from pimage import PImage
from pvideo import PVideo

# from memory_profiler import profile

app = Flask(__name__)
#CORS(app, resources={r"/api/*": {"origins": "http://localhost:3000"}})
#CORS(app, resources={r"/api/*": {"origins": "http://192.168.1.74:3000/"}})
#CORS(app, resources={r"/api/*": {"origins": "*"}})

cors = CORS(app)
#cors.init_app(app, resources={r"/api/*": {"origins": "*"}})

# Define a route for the root path
@app.route('/')
def home():
    return 'Hello from Flask!'  

def _process_image(imageFile, filterFile, low, high, direction, inFilter, createVideo, blend, bleed, interval_type, path_type, path_amp, path_x, path_freq, starburst=None, show_edges=None, use_mask=True):
    # Open the image using cv2
    img  = cv2.imdecode(np.frombuffer(imageFile.read(), np.uint8), cv2.IMREAD_COLOR)
    alpha_channel = np.full((img.shape[0], img.shape[1]), 255, dtype=np.uint8)
    img_with_alpha = cv2.merge([img, alpha_channel])
    if use_mask:
        filt = cv2.imdecode(np.frombuffer(filterFile.read(), np.uint8), cv2.IMREAD_UNCHANGED)
    else:
        filt = np.zeros_like(img_with_alpha)
        inFilter = True
    if createVideo:
        return PVideo.create_video(img_with_alpha, filt, low, high, direction, inFilter, blend, bleed, interval_type, path_type, starburst, 180)
    return PImage.process_frame(img_with_alpha, filt, low, high, direction, inFilter, blend, bleed, interval_type, path_type, path_amp, path_x, path_freq, starburst, show_edges)

def send_processed_image(img):
    #  convert the processed image back to bytes 
    _, img_encoded = cv2.imencode('.jpg', img)   
    return Response(img_encoded.tobytes(), mimetype='image/jpeg', headers={'Content-Type': 'image'}) 

def send_processed_video(video_path): 
    
    return send_file(video_path, as_attachment=True, download_name='processed_video.mp4', mimetype='video/mp4') 
 
@app.route('/api/process-image', methods=['POST']) 
# @profile
def process_image():
    
    if 'imageFile' not in request.files:
        return 'No file part'
    
    try:
        imageFile = request.files['imageFile']
        filterFile = request.files['filterFile']
        inFilter = request.form.get('inFilter').lower() == 'true'
        interval_type = request.form.get('intervalType')
        createVideo = request.form.get('createVideo').lower() == 'true'
        blend = request.form.get('blend').lower() == 'true'
        show_edges = request.form.get('showEdges').lower() == 'true' 
        use_mask = request.form.get('useMask').lower() == 'true' 
        bleed = float(request.form.get('bleed'))
        low = int(request.form.get('low'))
        high = int(request.form.get('high'))
        direction = int(request.form.get('direction')) 
        path_type = request.form.get('pathType')
        path_amp = int(request.form.get('pathAmp'))
        path_x = int(request.form.get('pathX')) 
        path_freq = int(request.form.get('pathFreq')) 

        star_point_str = request.form.get('starPoint')
        starburst = None
        if star_point_str:
            x_str, y_str = star_point_str.split(',')
            x = int(float(x_str))  # Convert to float first to handle decimal values
            y = int(float(y_str)) 
            starburst = [x, y]

        print('processing...') 
        processed_data = _process_image(imageFile, filterFile, low, high, direction, inFilter, createVideo, blend, bleed, interval_type, path_type, path_amp, path_x, path_freq, starburst, show_edges, use_mask)
        print('returning...')
        if createVideo:
            return send_processed_video(processed_data)
        return send_processed_image(processed_data)
    
    except Exception as e:
        app.logger.error(f"Error: {str(e)}")  
        # Print the entire stack trace
        app.logger.error("Stack trace:")
        traceback.print_exc()
        
        return str(e), 500



# Define the API route
@app.route('/api/data', methods=['GET'])
def get_data():
    # Load the image using cv2
    image_path = os.path.join(app.root_path, 'public', 'default.jpg')
    original_image = cv2.imread(image_path) 

    # Return the processed image as a response
    _, processed_image = cv2.imencode('.jpg', original_image) 
    return Response(processed_image.tobytes(), mimetype='image/jpeg')

def main():  
    app.run() 

if __name__ == '__main__': 
    main() 
