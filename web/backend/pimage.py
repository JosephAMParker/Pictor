import os
import concurrent.futures
from typing import Optional
import numpy as np
import math
import random
import cv2
import imutils 
from matplotlib.path import Path   

import time

USE_CONCURRENT = False

class PImage:
    
    frame: Optional[np.ndarray] = None  
    blank: Optional[np.ndarray] = None
    low: Optional[float] = None   
    high: Optional[float] = None   
    height: Optional[int] = None   
    width: Optional[int] = None  
    progess: Optional[int] = None
    
    def __randomColor():
        red = np.random.randint(0, 256)
        green = np.random.randint(0, 256)
        blue = np.random.randint(0, 256)
        randColor = np.array([blue, green, red], dtype=np.uint8)
        return randColor
        
    @classmethod
    def print_progress(cls): 
        cls.progess += 1
        print(str(cls.progess) + '/' + str(os.cpu_count()))  
    
    @classmethod
    def check_in_span(cls, value):
        return value >= cls.low and value <= cls.high

    @classmethod
    def sort_pixels(cls, span):
        span.sort(key=lambda x: x[0])
    
    @classmethod
    def get_sort_value(cls, pixel_value):
        return 0.299 * pixel_value[0] + 0.587 * pixel_value[1] + 0.114 * pixel_value[2] 

    @classmethod
    def get_value_matrix(cls):
        return [0.299, 0.587, 0.114, 1] 

        # cls.sort_type = "Brightness"

        # match cls.sort_type:
        #     case "Brightness":
        #         return [0.299, 0.587, 0.114, 1] 
        #     case "Hue":
        #         return [1,0,0]
        #     case "Lightness":
        #         return [0,1,0]
        #     case "Red":
        #         return [1,0,0,0]
        #     case "Green":
        #         return [0,1,0,0]
        #     case "Blue":
        #         return [0,0,1,0] 
            
    @classmethod
    def process_rows_old(cls, ys, yf): 
        frame, img_filter, width, alpha_channel = cls.frame, cls.img_filter, cls.width, cls.alpha_channel
        return cls._process_rows(ys, yf, frame, img_filter, alpha_channel, width, 0) 
    
    @classmethod
    def process_rows(cls, frame, ys, yf):   
        value_mat = cls.get_value_matrix() 

        if cls.sort_type in ('Hue', 'Lightness'):
            HSV = cv2.cvtColor(frame, cv2.COLOR_RGB2HSV) 
            frame_region = HSV[ys:yf, :]
        else:
            frame_region = frame[ys:yf, :]

        sort_array = cls.create_sort_array(frame_region, value_mat)

        edges = None
        if cls.interval_type == "threshold": 
            start_of_span_indices, end_of_span_indices = cls.create_span_indices(sort_array) 
        elif cls.interval_type == "random":
            start_of_span_indices, end_of_span_indices = cls.create_random_span_indices(frame_region.shape[0], frame_region.shape[1])  
        elif cls.interval_type == "edge":
            edges, start_of_span_indices, end_of_span_indices = cls.create_edge_span_indices(frame_region)  

        if edges is not None and cls.show_edges: 
            return  ys, yf, edges 
        
        return cls._process_rows_test(ys, yf, frame, sort_array, start_of_span_indices, end_of_span_indices)   
    
    @classmethod
    def _process_rows_test(cls, ys, yf, frame, sort_array, start_of_span_indices, end_of_span_indices):  
        
        stamp = np.zeros_like(frame)
        bleed = cls.bleed_constant
        shift = 0

        y = ys
        for i in range(len(start_of_span_indices[0])): 

            y0 = start_of_span_indices[0][i]
            y = y0 + ys
            
            span_s = start_of_span_indices[1][i]
            span_f = end_of_span_indices[1][i]

            if span_f - span_s > cls.min_span:
                
                if bleed > 0:
                    pixels = np.copy(frame[y, span_s:span_f])
                    # random_pixels = np.random.choice(pixels, size=int(0.3 * len(pixels)), replace=True)
                    # pixels = np.concatenate((pixels, random_pixels), axis=0)
                    # pixels = np.concatenate((pixels, pixels[:int(0.15 * len(pixels))]), axis=0)
                    # pixels = np.concatenate((pixels, pixels), axis=0) 
                    
                    scaling_factor = bleed
                    random_indices = np.random.choice(len(pixels), size=int(scaling_factor*pixels.shape[0]), replace=True)
                    random_pixels = pixels[random_indices]
                    pixels = np.concatenate((pixels, random_pixels), axis=0)

                    span_f = min(span_s + pixels.shape[0], frame.shape[1] - 1)
                    # span_s = max(span_f - pixels.shape[0], 0)

                    weighted_sum = np.dot(pixels[:, :4], cls.get_value_matrix()) 
                    indices = np.argsort(weighted_sum)[::-1] 

                    # try:
                    #     stamp[y, span_s:span_f] = pixels[indices][:span_f]
                    # except:
                    #     print('ss')
                    pixels = pixels[indices][:span_f-span_s]  
                else: 

                    # ss = np.argmax(frame[y, :, 3] > 0)
                    # span_s = max(ss, span_s)
                    # ff = frame.shape[1] - np.argmax(frame[y, ::-1, 3] > 0)
                    # span_f = max(ff, span_f)
                    # cv2.namedWindow("frame", cv2.WINDOW_NORMAL)
                    # cv2.imshow('frame', frame)
                    # key = cv2.waitKey()
                    indices = np.argsort(sort_array[y0, span_s:span_f])#[::-1]
                    pixels = frame[y, span_s:span_f][indices]


                # mean_values = np.mean(pixels[:, 1:], axis=0)
                # pixels[:, 1] = mean_values[0]
                # pixels[:, 2] = mean_values[1] 
                # pixels[0] = [0,0,255,255]
                # pixels[-1] = [0,255,0,255]
                span_s = min(stamp.shape[1] - 1, span_s + shift)
                span_f = min(stamp.shape[1] - 1, span_f + shift) 
                stamp[y, span_s:span_f] = pixels[:span_f - span_s]
        

        return ys, yf, stamp[ys:yf, :] 
    
    @classmethod
    def _process_rows(cls, ys, yf, frame, img_filter, alpha_channel, width, xs):  
        low, high  = cls.low, cls.high 
        stamp = np.zeros_like(frame)
        inSpan = False
        span = [] 


        brightness_mat = [0.299, 0.587, 0.114, 0]  
        frame_region = frame[ys:yf, :]  
        sort_array = cls.create_sort_array(frame_region, brightness_mat)


        for y in range(ys,yf):
            ss = -1   
            for x in range(xs, width): 
                
                pixel_value = frame[y, x] 
                
                sort_value = cls.get_sort_value(pixel_value)  

                if img_filter[y, x][3] == 0:
                    sort_value = -9999  
                
                if cls.check_in_span(sort_value):
                    
                    if not inSpan:
                        inSpan = True
                        span = []
                        ss = x 

                    span.append((sort_value, pixel_value)) 
                    
                else:
                    inSpan = False  
                    if len(span) > cls.min_span:
                         
                        cls.sort_pixels(span)
                        span_array = np.array([pixel for (_, pixel) in span], dtype=np.uint8)   
                        try: 
                            ac = alpha_channel[y, ss:ss + span_array.shape[0]].reshape((span_array.shape[0], 1))
                            blend_constant = 0
                            blended_region = (span_array * (ac - blend_constant)) + (frame[y, ss:ss + span_array.shape[0], :] * ((1 - blend_constant) - ac))   
                            stamp[y, ss:ss + span_array.shape[0], :] = blended_region.astype(np.uint8) 
                        except:
                            pass
                         
                            
                    span = []  
                    
        return ys, yf, stamp[ys:yf, :] 
    
    @classmethod
    def trim_rows(cls, rows, length):
            length = min(rows.shape[1], length)
            rows[:, :length] = cls.mask_outside_triangle(rows[:, :length])
            return rows

    @classmethod
    def mask_outside_triangle(cls, rows):
        # Get the shape of the array
        height, width, _ = rows.shape

        # Define the vertices of the triangle
        triangle_vertices = np.array([
            [0, height / 2],
            [width, 0],
            [width, height],
        ])

        # Create a path representing the triangle
        triangle_path = Path(triangle_vertices)

        # Create a meshgrid of coordinates
        x, y = np.meshgrid(np.arange(width), np.arange(height))

        # Flatten the coordinates
        points = np.vstack((x.flatten(), y.flatten())).T

        # Create a boolean mask indicating whether each point is inside the triangle
        mask = triangle_path.contains_points(points).reshape(height, width)

        # Apply the mask to the rows array
        rows[:, :width][~mask] = 0

        return rows

    @classmethod
    def stamp_onto(cls, stamp, transformed_rows, point):
        # Get the dimensions of the stamp and transformed_rows
        stamp_height, stamp_width, _ = stamp.shape
        rows_height, rows_width, _ = transformed_rows.shape

        # Calculate the region to stamp onto based on the point
        start_row = max(0, point[1])
        end_row = min(stamp_height, point[1] + rows_height)

        start_col = max(0, point[0])
        end_col = min(stamp_width, point[0] + rows_width)

        # Calculate the region to copy from transformed_rows
        rows_start_row = start_row - point[1]
        rows_end_row = rows_start_row + (end_row - start_row)

        rows_start_col = start_col - point[0]
        rows_end_col = rows_start_col + (end_col - start_col)

        # Stamp transformed_rows onto the stamp only if alpha (a) > 253
        alpha_condition = transformed_rows[rows_start_row:rows_end_row, rows_start_col:rows_end_col, 3] > 253
        stamp[start_row:end_row, start_col:end_col, :] = \
            np.where(alpha_condition[:, :, np.newaxis],
                    transformed_rows[rows_start_row:rows_end_row, rows_start_col:rows_end_col, :],
                    stamp[start_row:end_row, start_col:end_col, :])

        return stamp 
    
    @classmethod
    def create_sort_array(cls, frame_region, mat_mul):
        return np.matmul(frame_region, mat_mul)    

    @classmethod
    def checkThreshold(cls, sort_array, low, high):
        return (sort_array >= low) & (sort_array <= high)
    
    @classmethod
    def create_span_indices(cls, sort_array):

        max_val = max(sort_array.shape) + 1

        condition_array = np.where(cls.checkThreshold(sort_array, cls.low, cls.high), True, False) 
        condition_array = np.pad(condition_array, ((0, 0), (1, 1)), constant_values=False)

        # Find indices where it switches from True to False
        end_of_span_indices = np.where(np.logical_and(condition_array[:, :-1], ~condition_array[:, 1:]))
        sorted_indices_per_row = np.argsort(end_of_span_indices[1] + end_of_span_indices[0] * max_val)

        # Use the sorted indices to rearrange both arrays
        sorted_end_of_span_indices = (end_of_span_indices[0][sorted_indices_per_row],
                                    end_of_span_indices[1][sorted_indices_per_row])

        # Find indices where it switches from False to True
        start_of_span_indices = np.where(np.logical_and(~condition_array[:, :-1], condition_array[:, 1:]))
        sorted_indices_per_row = np.argsort(start_of_span_indices[1] + start_of_span_indices[0] * max_val)

        # Use the sorted indices to rearrange both arrays
        sorted_start_of_span_indices = (start_of_span_indices[0][sorted_indices_per_row],
                                    start_of_span_indices[1][sorted_indices_per_row]) 

        return sorted_start_of_span_indices, sorted_end_of_span_indices
    
    @classmethod
    def create_edge_span_indices(cls, img):

        # img = cls.frame 
        img_gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        img_blur = cv2.GaussianBlur(img_gray, (3,3), 0) 
        max_val = max(img_blur.shape) + 1 
 
        # Canny Edge Detection
        edges = cv2.Canny(image=img_blur, threshold1=cls.low - 255, threshold2=cls.high - 255) # Canny Edge Detection
        kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE,(5,5))
        closing = cv2.morphologyEx(edges, cv2.MORPH_CLOSE, kernel)
        dilate = cv2.dilate(edges,kernel,iterations = 1)
        gradient = cv2.morphologyEx(edges, cv2.MORPH_GRADIENT, kernel)
        tophat = cv2.morphologyEx(edges, cv2.MORPH_TOPHAT, kernel)
        blackhat = cv2.morphologyEx(edges, cv2.MORPH_BLACKHAT, kernel)
 
        # width = img.shape[1]
        # curve_values = (np.sin(np.linspace(0, 2 * np.pi, width)) + 1) * width / 2
        # pixel_positions = np.arange(width)
        # mapped_values = curve_values[pixel_positions.astype(int)]
        # sorted_indices = np.argsort(mapped_values)
        # sorted_pixels = img[:, sorted_indices] 

        # cv2.namedWindow("edges", cv2.WINDOW_NORMAL)
        # cv2.imshow('edges', edges)

        # cv2.namedWindow("closing", cv2.WINDOW_NORMAL)
        # cv2.imshow('closing', closing)

        # cv2.namedWindow("dilate", cv2.WINDOW_NORMAL)
        # cv2.imshow('dilate', dilate)

        # cv2.namedWindow("gradient", cv2.WINDOW_NORMAL)
        # cv2.imshow('gradient', gradient)

        # cv2.namedWindow("tophat", cv2.WINDOW_NORMAL)
        # cv2.imshow('tophat', tophat)
        
        # cv2.namedWindow("blackhat", cv2.WINDOW_NORMAL)
        # cv2.imshow('blackhat', blackhat)

        # key = cv2.waitKey(0)
        # cv2.destroyAllWindows()


        condition_array = np.where(edges == 0, True, False) 
        condition_array = np.pad(condition_array, ((0, 0), (1, 1)), constant_values=False)

        # Find indices where it switches from True to False
        end_of_span_indices = np.where(np.logical_and(condition_array[:, :-1], ~condition_array[:, 1:]))
        sorted_indices_per_row = np.argsort(end_of_span_indices[1] + end_of_span_indices[0] * max_val)

        # Use the sorted indices to rearrange both arrays
        sorted_end_of_span_indices = (end_of_span_indices[0][sorted_indices_per_row],
                                    end_of_span_indices[1][sorted_indices_per_row])

        # Find indices where it switches from False to True
        start_of_span_indices = np.where(np.logical_and(~condition_array[:, :-1], condition_array[:, 1:]))
        sorted_indices_per_row = np.argsort(start_of_span_indices[1] + start_of_span_indices[0] * max_val)

        # Use the sorted indices to rearrange both arrays
        sorted_start_of_span_indices = (start_of_span_indices[0][sorted_indices_per_row],
                                    start_of_span_indices[1][sorted_indices_per_row]) 

        rgba_image = np.zeros((*dilate.shape, 4), dtype=np.uint8)
        rgba_image[:, :, 0] = dilate  
        rgba_image[:, :, 1] = dilate 
        rgba_image[:, :, 2] = dilate 
        rgba_image[:, :, 3] = dilate  

        return rgba_image, sorted_start_of_span_indices, sorted_end_of_span_indices
    
    @classmethod
    def create_random_span_indices(cls, height, width):
        span_width = 44 
        num_spans = 45

        all_starts = np.empty((height, num_spans), dtype=int)
        all_ys = np.empty((height, num_spans), dtype=int)

        #create num_spans random span start locations  
        for y in range(height):
            starts = np.sort(np.array(random.sample(range(width - span_width), num_spans)))
            all_starts[y, :] = starts
            all_ys[y, :] = y

        # add span_width to each span start to create each full span 
        all_ends = all_starts + span_width

        all_starts = all_starts.flatten()
        all_ends = all_ends.flatten()
        all_ys = all_ys.flatten()

        start_of_span_indices = (all_ys, all_starts)
        end_of_span_indices = (all_ys, all_ends)

        return start_of_span_indices, end_of_span_indices 
    
    @classmethod
    def process_section(cls, angle_s, angle_f):

        frame, point = cls.frame, cls.star_point
        stamp = np.zeros_like(frame)  
        

        arc_size = 6
        for angle in range(angle_s, angle_f, arc_size):   

            # print(f"section {angle}, {angle + arc_size}")

            if angle < 0:
                angle += 360
            if angle >= 360:
                angle -= 360
                
            w, h = (frame.shape[1], frame.shape[0])
            
            d_x = -point[0]
            d_y = -point[1] + h//2
            
            Mr = cls.get_rotation_mat(angle, point)
            Mt = cls.get_translation_mat(d_x, d_y)
            M  = cls.chain_affine_transformation_mats(Mr, Mt) 
            transformed_frame  = cv2.warpAffine(frame, M, (w, h))  # Apply affine transformation with the chained (unified) matrix M. 
            w, h = (transformed_frame.shape[1], transformed_frame.shape[0])

            # transformed_frame = cls.shift_image_y(transformed_frame, cls.fc, 1)
            hlf_num_rows = 66
            _, _, rows = cls.process_rows(transformed_frame, h//2 - hlf_num_rows, h//2 + hlf_num_rows) 
            rows = cls.trim_rows(rows, 1400)

            # rows = cls.shift_image_y(rows, cls.fc, -1)
            transformed_rows = imutils.rotate_bound(rows, angle)
            w, h = (transformed_rows.shape[1], transformed_rows.shape[0])

            point_u = point.copy()

            if angle <= 90:
                point_u[0] -= int(hlf_num_rows * math.sin(angle * math.pi / 180))
                point_u[1] -= int(hlf_num_rows * math.cos(angle * math.pi / 180))

            if angle > 90 and angle < 270: 
                point_u[0] -= transformed_rows.shape[1]
            
            if angle > 90 and angle < 180:
                point_u[0] += int(hlf_num_rows * math.sin(angle * math.pi / 180))
                point_u[1] += int(hlf_num_rows * math.cos(angle * math.pi / 180)) 

            if angle >= 180 and angle <= 360: 
                point_u[1] -= transformed_rows.shape[0]  
                point_u[0] -= int(hlf_num_rows * math.sin(angle * math.pi / 180))
                point_u[1] -= int(hlf_num_rows * math.cos(angle * math.pi / 180)) 
            
            if angle >= 270:
                point_u[0] += int(2 * hlf_num_rows * math.sin(angle * math.pi / 180))
                point_u[1] += int(2 * hlf_num_rows * math.cos(angle * math.pi / 180)) 
            
           
            stamp = cls.stamp_onto(stamp, transformed_rows, point_u)  

        return stamp 

    @classmethod
    def process_star(cls, point):  

        frame = cls.frame
        allstamp = np.zeros_like(frame)   
        cls.star_point = point    
        allstamp[...] = cls.process_section(0, 361)
        
        return allstamp
    
    @classmethod 
    def process_direction(cls):
        frame, height = cls.frame, cls.height  
        stamp = np.zeros_like(frame)  
        _, _, stamp = cls.process_rows(frame, 0, height)    
        return stamp

    @classmethod
    def chain_affine_transformation_mats(cls, M0, M1):
        """ 
        Chaining affine transformations given by M0 and M1 matrices.
        M0 - 2x3 matrix applying the first affine transformation (e.g rotation).
        M1 - 2x3 matrix applying the second affine transformation (e.g translation).
        The method returns M - 2x3 matrix that chains the two transformations M0 and M1 (e.g rotation then translation in a single matrix).
        """
        T0 = np.vstack((M0, np.array([0, 0, 1])))  # Add row [0, 0, 1] to the bottom of M0 ([0, 0, 1] applies last row of eye matrix), T0 is 3x3 matrix.
        T1 = np.vstack((M1, np.array([0, 0, 1])))  # Add row [0, 0, 1] to the bottom of M1.
        T = T1 @ T0  # Chain transformations T0 and T1 using matrix multiplication.
        M = T[0:2, :]  # Remove the last row from T (the last row of affine transformations is always [0, 0, 1] and OpenCV conversion is omitting the last row).
        return M
    
    @classmethod
    def get_rotation_mat(cls, angle, pivot): 
        M = cv2.getRotationMatrix2D(pivot, angle, 1.0) 
        return M

    @classmethod
    def get_translation_mat(cls, d_x, d_y):
        M = np.float64([
            [1, 0, d_x],
            [0, 1, d_y]
        ])
    
        #return cv2.warpAffine(image, M, (image.shape[1], image.shape[0]))
        return M
    
    @classmethod
    def rotate_back(cls, stamp, rotate_angle, org_height, org_width):
        
        stamp = imutils.rotate_bound(stamp, -rotate_angle) 
        height, width, _ = stamp.shape  
        return stamp[int((height - org_height) / 2) : int((height + org_height) / 2),
                     int((width  - org_width)  / 2) : int((width  + org_width)  / 2)]  
    
    @classmethod 
    def rotate_back2(cls, stamp, rotate_angle, org_height, org_width):

        # stamp = imutils.rotate_bound(stamp, -rotate_angle) 

        # grab the dimensions of the image and then determine the
        # center
        (h, w) = stamp.shape[:2]
        (cX, cY) = (w / 2, h / 2)

        # grab the rotation matrix (applying the negative of the
        # angle to rotate clockwise), then grab the sine and cosine
        # (i.e., the rotation components of the matrix)
        M = cv2.getRotationMatrix2D((cX, cY), rotate_angle, 1.0)
        cos = np.abs(M[0, 0])
        sin = np.abs(M[0, 1])

        # compute the new bounding dimensions of the image
        width = int((h * sin) + (w * cos))
        height = int((h * cos) + (w * sin))

        # adjust the rotation matrix to take into account translation
        M[0, 2] += (width / 2) - cX
        M[1, 2] += (height / 2) - cY

        # perform the actual rotation and return the image
        return cv2.warpAffine(stamp, M, (width, height))[int((height - org_height) / 2) : int((height + org_height) / 2),
                                                         int((width  - org_width) / 2)  : int((width  + org_width)  / 2)]
 
    
    @classmethod
    def shift_image_y2(cls, image, f, const):
        h, w, _ = image.shape
        shifted_image = np.zeros_like(image)

        for x in range(w):
            shift_amount = int(f(x)) * const
            shifted_column = np.roll(image[:, x, :], shift_amount, axis=0)
            shifted_image[:, x, :] = shifted_column

        return shifted_image
    
    @classmethod
    def shift_image_y(cls, image, f, const):
        h, w, _ = image.shape

        for x in range(w):
            shift_amount = int(f(x)) * const
            # Use np.roll in place by assigning directly to the original array
            image[:, x, :] = np.roll(image[:, x, :], shift_amount, axis=0)

        return image
    
    @classmethod
    def shift_rotate(cls, image, const):
        h, w, _ = image.shape
        shifted_image = np.zeros_like(image)

        for x in range(w):
            shift_amount = int(cls.a * x * const)
            shifted_column = np.roll(image[:, x, :], shift_amount, axis=0)
            shifted_image[:, x, :] = shifted_column

        return shifted_image
    
    @classmethod
    def sin(cls, x):
        return math.sin(math.radians((x - cls.path_x)) * cls.path_freq / 90) * cls.path_amp 
    
    @classmethod
    def arc(cls, x):
        return 15 * cls.path_amp * (x-cls.path_x)*(x-cls.path_x) / (cls.width2)  
    
    @classmethod
    def circle(cls, x):  
        if x < cls.path_x - cls.path_amp or x > cls.path_x + cls.path_amp:
            return 0
        return math.sqrt(abs(cls.path_amp*cls.path_amp - math.pow(x - cls.path_x, 2)))
    
    @classmethod
    def cube(cls, x):
        return math.pow(x/2-226, 3) / 10000
    
    @classmethod
    def fc(cls, x):
        return cls.arc(x) * 90
    
    @classmethod
    def get_path_function(cls, path_type):
        if path_type == 'line':
            return 'line'
        if path_type == 'sine':
            return cls.sin 
        if path_type == 'curve':
            return cls.arc  
        if path_type == 'circle':
            return cls.circle 
      
    @classmethod  
    def process_frame(cls, frame, img_filter, low, high, direction, inFilter, blend, bleed, interval_type, path_type, path_amp, path_x, path_freq, starburst=None, show_edges=None):    
        

        # #frame = cls.shift_image_y(frame, cls.fc, 1)
        # cls.center = 100
        flip_image = False
        org_height, org_width, _ = frame.shape 
        if (direction > 90 and direction < 180) or (direction > 270 and direction < 360):
            flip_image = True
            frame = np.fliplr(frame)
            img_filter = np.fliplr(img_filter)
            # frame = cv2.flip(frame, 1)
            # img_filter = cv2.flip(img_filter, 1)
            direction = 360 - direction
            if starburst:
                starburst[0] = org_width - starburst[0]

        radians = math.radians(direction) 
        # Calculate the slope using the tangent of the angle
        slope = math.tan(radians)
        cls.a = slope
        
        cls.path_amp = path_amp

        cls.path_x = path_x 
        cls.path_freq = path_freq
        cls.path_fn = cls.get_path_function(path_type)
        rotate_angle = direction
        # if (direction >= 0 and direction <= 90) or (direction >= 180 and direction <= 270):
        cls.path_x -= (org_width - abs( (org_height * math.sin(math.radians(direction))) + (org_width * math.cos(math.radians(direction))))) / 2  
        # else:
        #     pass
        #     rotate_angle += 180
        #     rotate_angle += 180
        #     frame = cv2.flip(frame, 1)
        #     frame = cv2.flip(frame, 0)
        #     cls.path_x += (org_height - abs( (org_height * math.cos(math.radians(direction))) + (org_width * math.sin(math.radians(direction))))) / 2 
         
        blur_constant = max(org_height, org_width) // 30 

        original_frame = np.copy(frame)  
        if inFilter:
            # alpha_channel = img_filter[:, :, 3] / 255.0
            img_filter[img_filter[:, :, 3] == 0, :3] = [255, 255, 255] 
            img_filter[img_filter[:, :, 3] == 255, :3] = [0, 0, 0] 
            img_filter[:, :, 3] =  (255 - img_filter[:, :, 3]) 
        # alpha_channel = img_filter[:, :, 3] / 255.0 
        # original_alpha_channel = img_filter[:, :, 3] / 255.0
        if not starburst:
            frame = imutils.rotate_bound(frame, rotate_angle)
            # img_filter = imutils.rotate_bound(img_filter, rotate_angle) 

        # cv2.namedWindow("f", cv2.WINDOW_NORMAL)
        # cv2.imshow('f', frame)

        # frame = imutils.rotate_bound(frame, -90)
        # img_filter = imutils.rotate_bound(img_filter, -90)

        # cv2.namedWindow("z", cv2.WINDOW_NORMAL)
        # cv2.imshow('z', frame)

        # key = cv2.waitKey(0)
        # cv2.destroyAllWindows()

        # Get image dimensions
        height, width, _ = frame.shape  
        cls.height = height
        cls.width = width 
        cls.width2 = width * width
        if not starburst:
            cls.frame = frame
            if cls.path_fn != 'line':
                
                
                # cls.frame = cls.shift_rotate(cls.frame, 1)
                cls.frame = cls.shift_image_y(cls.frame, cls.path_fn, 1) 

                
        else:
            cls.frame = frame
        # cls.alpha_channel = alpha_channel 
        # cls.img_filter = img_filter  
        cls.inFilter = inFilter 
        cls.low = low + 255
        cls.high = high + 255
        cls.min_span = 1
        cls.progess = 0
        cls.sort_type = "Brightness"
        cls.bleed_constant = bleed  
        cls.interval_type = interval_type
        cls.show_edges = show_edges

        start = time.time() 

        if starburst:
            stamp = cls.process_star(starburst)
        else:
            stamp = cls.process_direction() 
            if cls.path_fn != 'line':
                
                stamp = cls.shift_image_y(stamp, cls.path_fn, -1)
                # stamp = cls.shift_rotate(stamp, -1) 
            stamp = cls.rotate_back2(stamp, rotate_angle, org_height, org_width)   

        if cls.show_edges: 
            dimmed_frame = original_frame * 0.65
            # Blend images using alpha channel of the stamp as a transparency mask
            blended_image = cv2.addWeighted(dimmed_frame, 1, stamp, 0.9, 0, dtype=cv2.CV_8U)
            return blended_image 

        # blend_constant = 0
        # alpha_channel = original_alpha_channel
        # blended_region = (stamp * (alpha_channel[:, :, np.newaxis] - blend_constant)) + (original_frame * ((1 - blend_constant) - alpha_channel[:, :, np.newaxis])) 
        # out_frame = np.where(blended_region[:, :, 3][:, :, None] > 250, blended_region, original_frame).astype(np.uint8)
        blend_constant = 0
        # alpha_channel = original_alpha_channel
        alpha_channel = None
        if blend: 
            img_filter = cv2.blur(img_filter, (blur_constant, blur_constant))
            alpha_channel = (img_filter[:, :, 3] / 255.0)
        else:
            alpha_channel = (img_filter[:, :, 3] / 255.0)
        out_frame = None
        # blended_region = ((stamp * (alpha_channel[:, :, np.newaxis] - blend_constant)) + (original_frame * ((1 - blend_constant) - alpha_channel[:, :, np.newaxis])))
        if flip_image:
            out_frame = np.where(((stamp * ((img_filter[:, :, 3] / 255.0)[:, :, np.newaxis])) + (original_frame * (1 - alpha_channel[:, :, np.newaxis])))[:, :, 3][:, :, None] > 250, ((stamp * (alpha_channel[:, :, np.newaxis])) + (original_frame * (1 - alpha_channel[:, :, np.newaxis]))), original_frame).astype(np.uint8)
        else:
            out_frame = np.where(((stamp * (alpha_channel[:, :, np.newaxis])) + (original_frame * (1 - alpha_channel[:, :, np.newaxis])))[:, :, 3][:, :, None] > 250, ((stamp * (alpha_channel[:, :, np.newaxis])) + (original_frame * (1 - alpha_channel[:, :, np.newaxis]))), original_frame).astype(np.uint8)

        end = time.time() 
        print(f'total time: {end - start}')
        cls.clear_class()
        if flip_image: 
            # return out_frame
            return np.fliplr(out_frame)
        return out_frame   
    
    @classmethod
    def get_alpha_channel(cls, img_filter):
        return img_filter[:, :, 3] / 255.0
    
    @classmethod 
    def clear_class(cls):
        del cls.frame 