# black_hole_sun.py  

from bisect import bisect_left
from collections import defaultdict
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
        dp = 0.05
        P = 3 * self.M
        P_end = 50 * self.M
        while P <= P_end:
            b = self.b_from_P(P)  
            P_from_b.append((b,P))
            P += dp
            print(P, P_end)

        # P = 2 * self.M + dp
        # P_end = 3 * self.M
        # while P <= P_end:
        #     b = self.b_from_P(P+P_end)  
        #     P_from_b.append((b,P))
        #     P += dp

        self.P_from_b = P_from_b
        self.P_from_b.sort(key=lambda r: r[0])    
        return P_from_b
    
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
    
def math_cot(x):
    return math.cos(x) / math.sin(x)

def main(bhs, theta_deg):

    _, b = bhs.cartesian_to_polar(-w//2,-h//2)  
    θ = theta_deg * math.pi /  180
    image = np.zeros((h, w))
    data = np.zeros((h, w))
    newt = np.zeros((h, w))
    final = np.zeros((h, w))
    ghost = np.zeros((h, w))
    ghost_b = np.zeros((h, w))
    # 27*M*M
    minP = 999
    for x in range(-w//2, w//2): 
        print(x, '/', w//2)
        for y in range(-h//2, h//2):
            
            scl = 0.6
            a,b = bhs.cartesian_to_polar(x*scl, y*scl)  
            yPos = y+h//2
            bc = math.sqrt(3)*3*M 
            # if b <= 27*bhs.M*bhs.M:
            #     continue

            # P = bhs.get_closest_P(b)   
            bP = bhs.get_closest_P_binary_search(b)  
            P = bP[1]
            # P2 = bhs.P_from_b2(b) 

            Q = math.sqrt((P-2*M)*(P+6*M)) 
            k2 = (Q-P+6*M)/(2*Q)
            k = math.sqrt(k2)
            zeta = math.asin(math.sqrt((Q-P+2*M) / (Q-P+6*M))) 
            F_zeta_k = ellipkinc(zeta, k2)  
            cos_ga = math.cos(a) / math.sqrt(math.cos(a)**2 + math_cot(θ)**2) 
            ga = math.acos(cos_ga)
            argument = (ga/(2 * math.sqrt(P / Q))) + F_zeta_k
            sn = ellipj(argument, k)[0] 
            sn_squared = sn**2
            L = (Q-P+2*M)/(4*M*P)
            R = (Q-P+6*M)/(4*M*P) 
            r = 1/(R * sn_squared - L)    
            
            si = math.sin(ga) 
            if si != 0:
                rp = b/si 
                 
            z = bhs.calculate_Z(r, a, b, θ) 

            
            # if b<bc or b>bc+4:
                 
            #     Fs = bhs.calculate_Fs(r)
            #     Fo = bhs.calculate_Fo(Fs, z)
            #     final[yPos, w-(x+w//2)-1] = Fs / 22

            if b<bc: 
                ang = a * 180 / math.pi
                if ((x <= 0 and ang >= 0) or (x > 0 and ang > -90)):  
                    if rp > 6*M: 
                        if b > bc and rp < 6*M   :
                            pass
                        else:  

                            z = bhs.calculate_Z(rp, a, b, θ) 
                            Fs = bhs.calculate_Fs(rp) 
                            Fo = bhs.calculate_Fo(Fs, z)

                            image[yPos, x+w//2] = rp  
                            # image[yPos, w-(x+w//2)-1] = rp 

                            data[yPos, x+w//2] = Fs 
                            # data[yPos, w-(x+w//2)-1] = Fs

                            final[yPos, w-(x+w//2)-1] = Fo 
                            # final[yPos, w-(x+w//2)-1] = Fo

            image[y+h//2, x+w//2] = r
            if b>bc and r >= 6*M:   
                Fs = bhs.calculate_Fs(r)
                Fo = bhs.calculate_Fo(Fs, z)

                image[y+h//2, x+w//2] = r
                # image[y+h//2, w-(x+w//2)-1] = r

                data[y+h//2, x+w//2] = Fs
                # data[y+h//2, w-(x+w//2)-1] = Fs 

                # final[yPos, w-(x+w//2)-1] = Fo 
                final[yPos, w-(x+w//2)-1] = Fo

                
            n = 1 
            if n>0:  
                # if k2 >= 1:
                #     if b >= bc * 0.99: 
                #         k2 = 0.999999999 
                #         k = 0.999999
                if k2 < 1 and k < 1 and b >= bc * 1.01:
                
                    ell_k = ellipk(k2)  # calculate complete elliptic integral of mod m = k²
                    ellips_arg = (ga - 2. * n * np.pi) / (2. * np.sqrt(P / Q)) - F_zeta_k + (2. * ell_k)
                    sn_g = ellipj(ellips_arg, k)[0]
                    sn_g_squared = sn_g**2
                    r_g = 1/(R * sn_g_squared - L)

                    if r_g > 0:
                        z_g = bhs.calculate_Z(r_g, a, b, θ) 

                        yPos = h-(y+h//2)-1
                        Fs = bhs.calculate_Fs(r_g**2)
                        Fo = bhs.calculate_Fo(Fs, z_g) 
                        if(not math.isnan(Fo)): 
                            ghost[yPos, w-(x+w//2)-1] = Fo 
                            F0 = Fo
                        
                        Fs = bhs.calculate_Fs(r_g)
                        Fo = bhs.calculate_Fo(Fs, z_g) 
                        if(not math.isnan(Fo) and Fo > 0):  
                             
                            if y > 0:
                                Fo /= 1
                            ghost_b[yPos, w-(x+w//2)-1] = Fo 
            
 
    # scaled_data = getScaled(data)
    # scaled_image = getScaled(image)
    # scaled_newt = getScaled(newt)
    scaled_final = getScaled(final)
    scaled_ghost = getScaled(ghost)

    mean_excluding_zeros = np.mean(ghost_b[ghost_b != 0])

    # # Clamp the maximum values to the mean value excluding zeros
    # clamped_array = np.clip(ghost_b, a_min=0, a_max=mean_excluding_zeros)

    n = 50

    # Find the indices of the n largest values
    largest_indices = np.argpartition(ghost_b.flatten(), -n)[-n:]

    # Convert the flattened indices to 2D indices
    row_indices, col_indices = np.unravel_index(largest_indices, ghost_b.shape)

    # Set the values at the largest indices to 0
    ghost_b[row_indices, col_indices] = mean_excluding_zeros
    scaled_ghost_b = getScaled(ghost_b)
    # scaled_newt_FS = getScaled(newt_FS)
    
    # cv2.namedWindow("fs", cv2.WINDOW_NORMAL)
    # cv2.imshow("fs", scaled_data) 

    # cv2.namedWindow("newt", cv2.WINDOW_NORMAL)
    # cv2.imshow("newt", newt.astype("uint8")) 

    cv2.namedWindow(str(theta_deg)+"ghost_b", cv2.WINDOW_NORMAL)
    cv2.imshow(str(theta_deg)+"ghost_b", scaled_ghost_b)

    # cv2.namedWindow(str(theta_deg)+"ghost_0", cv2.WINDOW_NORMAL)
    # cv2.imshow(str(theta_deg)+"ghost_0", scaled_ghost) 

    # cv2.namedWindow("both", cv2.WINDOW_NORMAL)
    # cv2.imshow("both", ((scaled_ghost + scaled_ghost_b))) 

    # cv2.namedWindow(str(theta_deg)+"boty", cv2.WINDOW_NORMAL)
    # cv2.imshow(str(theta_deg)+"boty", np.maximum(scaled_final, scaled_ghost_b))

    cv2.namedWindow(str(theta_deg)+"boscaled_finalty", cv2.WINDOW_NORMAL)
    cv2.imshow(str(theta_deg)+"boscaled_finalty", scaled_final)

    # cv2.namedWindow("newt", cv2.WINDOW_NORMAL)
    # cv2.imshow("newt", scaled_newt_FS)
    


def getScaled(data):
    max_value = np.max(data)
    min_value = np.min(data) 
    data_range = max_value - min_value
    if data_range == 0:
        return data
    scaled_data = (data - min_value) / data_range 
    return scaled_data

if __name__ == "__main__":

    M = 8
    w = 700
    h = 500

    bhs = BlackHoleSolver(M, h, w) 
    bhs.generate_mapping()   
    main(bhs, 70) 
    main(bhs, 87)

    cv2.waitKey(0)
    cv2.destroyAllWindows()