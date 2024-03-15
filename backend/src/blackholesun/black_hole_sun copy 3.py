# black_hole_sun.py  

from bisect import bisect_left
from collections import defaultdict
import json
from scipy.optimize import root_scalar
from scipy.special import ellipj, ellipkinc,ellipk
from scipy.optimize import fsolve
import math
import numpy as np
import cv2
 

class BlackHoleSolver:

    def __init__(self, M, h, w):
        self.M = M
        self.h = h
        self.w = w
        self.P_b_mapping = {}  
        self.b_P_mapping = {}    
        self.bc = math.sqrt(3)*3*M 
        self.maxVal = 0.0017391584949666232 
        self.maxGh = 0
        # self.maxGh = 0.0006215700770593675
    
    def b_from_P(self, P):
        """
        Define the equation to solve.
        """
        return math.sqrt((P ** 3) / (P - 2 * self.M))
    
    def cartesian_to_polar(self, x, y):
        """
        Convert Cartesian coordinates (x, y) to polar coordinates (a, b)
        considering the image width (w) and height (h).
        """ 

        b = math.sqrt(x**2 + y**2)
        a = math.atan2(y, x)  # Using atan2 to correctly handle all quadrants

        return a - math.pi/2, b 
    
    def equation_to_solve(self, P, b):
        """
        Define the equation to solve.
        """
        return (P ** 3) / (P - 2 * self.M) - b 
    
    def generate_mapping(self):
        P_from_b = []
        dp = self.M / 240
        P = 3 * self.M
        P_end = 50 * self.M
        while P <= P_end:
            b = self.b_from_P(P)  
            P_from_b.append((b,P))
            P += dp
            print(P, P_end) 

        self.P_from_b = P_from_b
        self.P_from_b.sort(key=lambda r: r[0])    
        return self.P_from_b
    
    def get_closest_P(self, b):
        P_from_b = self.P_from_b
        closest_b = min(P_from_b, key=lambda x: abs(x[0] - b))
        return closest_b[1]
    
    def get_closest_P_binary_search(self, b): 
        i = bisect_left(self.P_from_b, b, key=lambda r: r[0])

        if i == len(self.P_from_b):
            return self.P_from_b[i-1]
        
        if i == 0:
            return self.P_from_b[i]
        
        closest = min([self.P_from_b[i-1], self.P_from_b[i]], key=lambda x: abs(x[0]-b))
        return closest
    
    def calculate_Fs(self, r):
        M = self.M
        Mr = 0.8
        rs = r/M
        A = (3*M*Mr) / (8*math.pi)
        B = 1/((rs - 3)*rs**(5/2)) 

        sq_rs = math.sqrt(rs)
        sq_3  = math.sqrt(3)
        sq_6  = math.sqrt(6)
        ln = (sq_rs + sq_3)*(sq_6 - sq_3)
        ld = (sq_rs - sq_3)*(sq_6 + sq_3)
        log = math.log(ln/ld, 10)  

        C = sq_rs - sq_6 + (sq_3/3) * log 

        return A*B*C
    
    def calculate_Z(self, r, a, b, θ):
        zA = (1-3*self.M/r)**(-1/2)
        zB = (1+math.sqrt(self.M/(r**3))*b*math.sin(θ)*math.sin(a))
        return zA*zB 
    
    def calculate_Fo(self, Fs, z):
        return Fs/(z**4)
    
    def calculate_gamma(self, a, θ):
        cos_ga = math.cos(a) / math.sqrt(math.cos(a)**2 + math_cot(θ)**2) 
        return math.acos(cos_ga)
    
    def calculate_primary_image_values(self, r, a, b, θ):
        if b>self.bc and r >= 6*M:  
            z = bhs.calculate_Z(r, a, b, θ) 
            Fs = bhs.calculate_Fs(r)
            Fo = bhs.calculate_Fo(Fs, z) 
            return {'r':r, 'Fs':Fs, 'Fo':Fo}
        
    def calculate_secondary_image_values(self, a, b, θ, n, k2, gamma, P, Q, R, L, F_zeta_k): 

        k = math.sqrt(k2)
        if k2 < 1 and k < 1 and b > self.bc * 1.01:
        
            ell_k = ellipk(k2)  # calculate complete elliptic integral of mod m = k²
            ellips_arg = (gamma - 2. * n * np.pi) / (2. * np.sqrt(P / Q)) - F_zeta_k + (2. * ell_k)
            sn = ellipj(ellips_arg, k2)[0]
            sn_squared = sn**2
            r = 1/(R * sn_squared - L)

            if r > 0:
                z = bhs.calculate_Z(r, a, b, θ)   
                Fs = bhs.calculate_Fs(r)  
                Fo = bhs.calculate_Fo(Fs, z)  
                if(not math.isnan(Fo) and Fo > 0):
                    return {'r':r, 'Fs':Fs, 'Fo':Fo}

    def calculate_newtonian_image_values(self, a, x, b, gamma, θ):
        si = math.sin(gamma) 
        if si == 0:
            return None
  
        r = b/si * 1
        if r > 6*M: 
            if b > self.bc and r < 6*M:
                pass
            else:   
                z = bhs.calculate_Z(r, a, b, θ) 
                Fs = bhs.calculate_Fs(r) 
                Fo = bhs.calculate_Fo(Fs, z) 
                return {'r':r, 'Fs':Fs, 'Fo':Fo}
    
def math_cot(x):
    return math.cos(x) / math.sin(x)

def main(bhs: BlackHoleSolver, theta_deg):

    _, b = bhs.cartesian_to_polar(-w//2,-h//2)  
    θ = theta_deg * math.pi /  180
    image = np.zeros((h, w))
    data = np.zeros((h, w))
    primary_image = np.zeros((h, w))
    newt = np.zeros((h, w))
    final = np.zeros((h, w))
    ring = np.zeros((h, w))
    ghost_image = np.zeros((h, w)) 

    ringBri = bhs.maxVal / 2
    upscale = 8
    ring_large = np.zeros((h * upscale, w * upscale))
    center_x = w * upscale // 2
    center_y = h * upscale // 2
    radius_large = int(round(bhs.bc * upscale * 1.01))
    radius = int(round(bhs.bc * upscale * 1.005))
    cv2.circle(ring_large, (center_x, center_y), radius_large, (ringBri, ringBri, ringBri), -1)  
    ring_large = cv2.blur(ring_large, (90, 90), 0) 
    cv2.circle(ring_large, (center_x, center_y), radius, (0, 0, 0), -1)  
    ring = cv2.resize(ring_large, (w, h), interpolation=cv2.INTER_AREA)  
    
    maxR = 350
        
    for x in range(-w//2, w//2): 
        print(x, '/', w//2)
        for y in range(h // 2, -h // 2, -1): # iterate in reverse to allow checking primary value when getting secondary 
            
            scl = 1
            a,b = bhs.cartesian_to_polar(x*scl, y*scl)  
            yPos = y+h//2-1
            xPos = w-(x+w//2)-1  

            bP = bhs.get_closest_P_binary_search(b)  
            P = bP[1] 
            Q = math.sqrt((P-2*M)*(P+6*M)) 
            k2 = (Q-P+6*M)/(2*Q)
            k = math.sqrt(k2)
            zeta = math.asin(math.sqrt((Q-P+2*M) / (Q-P+6*M))) 
            F_zeta_k = ellipkinc(zeta, k2)  
            gamma = bhs.calculate_gamma(a, θ)
            argument = (gamma/(2 * math.sqrt(P / Q))) + F_zeta_k
            sn_k2 = k2
            if theta_deg < 60:
                sn_k2 = k 
            sn = ellipj(argument, sn_k2)[0] 
            sn_squared = sn**2
            L = (Q-P+2*M)/(4*M*P)
            R = (Q-P+6*M)/(4*M*P) 
            r = 1/(R * sn_squared - L)  

            blend_max = bhs.bc*1.3 
            ghost_edge = 48 - theta_deg / 2
            ring_edge = ghost_edge 

            primary = bhs.calculate_primary_image_values(r, a, b, θ)
            
            if primary:  
                image[yPos, xPos] += primary['r']
                if r < maxR:
                    data[yPos, xPos]  += primary['Fs']  
                    primary_image[yPos, xPos] = primary['Fo']  
                    final[yPos, xPos] = primary['Fo']
                else:
                    primary_image[yPos, xPos] = primary['Fo'] / ((r-maxR)*1/maxR + 1)
                    final[yPos, xPos] = primary['Fo'] / ((r-maxR)*1/maxR + 1)

            newtonian = bhs.calculate_newtonian_image_values(a, x, b, gamma, θ)  
            if newtonian:    
                if ((x <= 0 and a >= 0) or (x > 0 and a > -math.pi/2)):
                    if b<=bhs.bc:     
                        final[yPos, xPos] = newtonian['Fo']  
                        primary_image[yPos, xPos] = newtonian['Fo']
                        image[yPos, xPos] = newtonian['r'] 
                    elif b<blend_max:
                        alpha = (b - blend_max) / (bhs.bc - blend_max)  
                        alpha = alpha**4
                        final[yPos, xPos] = final[yPos, xPos]*(1-alpha) + newtonian['Fo']*(alpha) 
                        primary_image[yPos, xPos] = primary_image[yPos, xPos]*(1-alpha) + newtonian['Fo']*(alpha) 
                    newt[yPos, xPos]  += newtonian['Fo']
                else:
                    if b>bhs.bc:
                        newt[yPos, xPos]  += newtonian['Fo']
            ns = [1]
            for n in ns: 
                # yPos = h-(y+h//2)-1  
                r = image[yPos, xPos]  
                ghost = bhs.calculate_secondary_image_values(a, b, θ, n, k2, gamma, P, Q, R, L, F_zeta_k)
                if ghost:  
                    ghost_val = ghost['Fo']  
                    if r <= 6*M:
                        final[yPos, xPos] = ghost_val
                        ghost_image[yPos, xPos] = ghost_val 
                    elif r >= ghost_edge*M:
                        ra = min(1, ((r-ghost_edge*M)/(10*M)))
                        final[yPos, xPos] += ghost_val * ra
                        ghost_image[yPos, xPos] += ghost_val * ra
                ghost = None 

            ringVal = ring[yPos, xPos] 
 
            if r >= ring_edge*M:
                z = bhs.calculate_Z(r, a, b, θ)  
                Fo = bhs.calculate_Fo(ringVal, z) 
                ra = min(1, ((r-ring_edge*M)/(10*M)))
                final[yPos, xPos] += Fo * ra
                 
 
    # scaled_data = getScaled(data) 
    scaled_newt = getScaled(newt)
    scaled_final = getScaled(final)

    scaled_primary = getScaled(primary_image)
    scaled_ghost = getScaled(ghost_image)
    scaled_ring = getScaled(ring)
    
#     for x in range(-w//2, w//2): 
#         print(x, '/', w//2)
#         for y in range(h // 2, -h // 2, -1):
#             yPos = y+h//2-1
#             xPos = w-(x+w//2)-1  
#             if scaled_primary[yPos, xPos] > 0.03:
#                 pixel_types_dict[f"{yPos} {xPos}"] = 1

# scaled_primary

    # with open('pixel_types.json', 'w') as json_file:
    #     json.dump(pixel_types_dict, json_file)

    # cv2.namedWindow(str(theta_deg)+"scaled_ghost", cv2.WINDOW_NORMAL)
    # cv2.imshow(str(theta_deg)+"scaled_ghost", scaled_ghost)

    # cv2.namedWindow(str(theta_deg)+"scaled_primary", cv2.WINDOW_NORMAL)
    # cv2.imshow(str(theta_deg)+"scaled_primary", scaled_primary )  
    # cv2.namedWindow(str(theta_deg)+"scaled_ring", cv2.WINDOW_NORMAL)
    # cv2.imshow(str(theta_deg)+"scaled_ring", scaled_ring) 
    # cv2.namedWindow("both", cv2.WINDOW_NORMAL)
    # cv2.imshow("both", ((scaled_ghost + scaled_ghost_b))) 

    # cv2.namedWindow(str(theta_deg)+"boty", cv2.WINDOW_NORMAL)
    # cv2.imshow(str(theta_deg)+"boty", np.maximum(scaled_final, scaled_ghost_b))

    # cv2.namedWindow(str(theta_deg)+"boscaled_finalty", cv2.WINDOW_NORMAL)
    # cv2.imshow(str(theta_deg)+"boscaled_finalty", scaled_final)


    fin_final = cv2.resize(scaled_final, (fin_w, fin_h), interpolation=cv2.INTER_LANCZOS4)
    cv2.imwrite("bh-" + str(theta_deg) + ".png", (fin_final * 255).astype("uint8"))
    fin_newt = cv2.resize(scaled_newt, (fin_w, fin_h), interpolation=cv2.INTER_LANCZOS4)
    cv2.imwrite("newtonian-" + str(theta_deg) + ".png", (fin_newt * 255).astype("uint8"))  

    scaled_primary_with_alpha = np.ones((*scaled_primary.shape, 4), dtype=np.uint8) * 255 
    scaled_primary_with_alpha[:, :, 3] = (scaled_primary * 255).astype(np.uint8)
    fin_primary = cv2.resize(scaled_primary_with_alpha, (fin_w, fin_h), interpolation=cv2.INTER_LANCZOS4)
    cv2.imwrite("primary-" + str(theta_deg) + ".png", fin_primary) 

    scaled_ghost_with_alpha = np.ones((*scaled_ghost.shape, 4), dtype=np.uint8) * 255 
    scaled_ghost_with_alpha[:, :, 3] = (scaled_ghost * 255).astype(np.uint8) 
    fin_ghost = cv2.resize(scaled_ghost_with_alpha, (fin_w, fin_h), interpolation=cv2.INTER_LANCZOS4)
    cv2.imwrite("ghost-" + str(theta_deg) + ".png", fin_ghost) 

    scaled_ring_with_alpha = np.ones((*scaled_ring.shape, 4), dtype=np.uint8) * 255 
    scaled_ring_with_alpha[:, :, 3] = (scaled_ring * 255).astype(np.uint8) 
    fin_ring = cv2.resize(scaled_ring_with_alpha, (fin_w, fin_h), interpolation=cv2.INTER_LANCZOS4)  
    cv2.imwrite("ring-" + str(theta_deg) + ".png", fin_ring)
 
    # cv2.namedWindow("scaled_image", cv2.WINDOW_NORMAL)
    # cv2.imshow("scaled_image", (image * 255).astype("uint8"))
    # cv2.namedWindow(str(theta_deg)+"newt", cv2.WINDOW_NORMAL)
    # cv2.imshow(str(theta_deg)+"newt", scaled_newt_FS)  

    # cv2.namedWindow(str(theta_deg)+"scaled_image", cv2.WINDOW_NORMAL)
    # cv2.imshow(str(theta_deg)+"scaled_image", (scaled_image * 255).astype("uint8"))
    


def getScaled(data):
    max_value = np.max(data)
    min_value = np.min(data)  
    data_range = max_value - min_value
    if data_range == 0:
        return data
    scaled_data = (data - min_value) / data_range 
    return scaled_data

if __name__ == "__main__":

    M = 25
    w = 300
    h = 300
    # w = 1920
    # h = 1080  
    fin_w = 1206
    fin_h = 678
    fin_w = 300
    fin_h = 300

    bhs = BlackHoleSolver(M, h, w) 
    bhs.generate_mapping() 

    main(bhs, 1) 
    main(bhs, 5) 
    main(bhs, 15)
    main(bhs, 25) 
    main(bhs, 35) 
    main(bhs, 45)
    main(bhs, 55) 
    main(bhs, 65) 
    main(bhs, 70) 
    main(bhs, 75)
    main(bhs, 80)
    main(bhs, 85)
    main(bhs, 86)
    main(bhs, 87) 
    main(bhs, 88)
    main(bhs, 89)
    main(bhs, 89.5)
    main(bhs, 89.9)


    cv2.waitKey(0)
    cv2.destroyAllWindows()