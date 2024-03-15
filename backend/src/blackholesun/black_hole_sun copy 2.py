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
        self.bc = math.sqrt(3)*3*M 
    
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
        dp = self.M / 6666
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
        if k2 < 1 and k < 1 and b >= self.bc * 1.01:
        
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
  
        r = b/si * 0.97
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
    newt = np.zeros((h, w))
    final = np.zeros((h, w))
    ghost = np.zeros((h, w))
    ghost_b = np.zeros((h, w))
    
    for x in range(-w//2, w//2): 
        print(x, '/', w//2)
        for y in range(h // 2, -h // 2, -1): # iterate in reverse to allow checking primary value when getting secondary 
            
            scl = 10
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
            sn = ellipj(argument, k)[0] 
            sn_squared = sn**2
            L = (Q-P+2*M)/(4*M*P)
            R = (Q-P+6*M)/(4*M*P) 
            r = 1/(R * sn_squared - L)   

            primary = bhs.calculate_primary_image_values(r, a, b, θ)
            if primary: 
                image[yPos, xPos] += primary['r']  
                data[yPos, xPos]  += primary['Fs'] 
                final[yPos, xPos] += primary['Fs'] 

            newtonian = bhs.calculate_newtonian_image_values(a, x, b, gamma, θ)  
            if newtonian:  
                image[yPos, xPos] += newtonian['r']  
                newt[yPos, xPos]  += newtonian['Fs'] 
                c = 0
                if b<bhs.bc:   
                    ang = a * 180 / math.pi
                    if ((x <= 0 and ang >= 0) or (x > 0 and ang > -90)):
                        final[min(yPos + c, h-1), xPos] += 0 #newtonian['Fs']  
          
            ns = [1]
            for n in ns: 
                ghost_1 = bhs.calculate_secondary_image_values(a, b, θ, n, k2, gamma, P, Q, R, L, F_zeta_k)
                if ghost_1:
                    yPos = h-(y+h//2)-1
                    ghost_b[yPos, xPos] += ghost_1['Fs'] 
                    #
                    ghost_edge = 48 - theta_deg / 2
                    r = image[yPos, xPos]
                    if r <= 6*M:
                        final[yPos, xPos] += ghost_1['Fs'] 
                    elif r >= ghost_edge*M:
                        ra = min(1, ((r-ghost_edge*M)/(10*M)) )
                        final[yPos, xPos] += ghost_1['Fs'] * ra
                ghost_1 = None 
            
 
    # scaled_data = getScaled(data)
    scaled_image = getScaled(image)
    scaled_newt = getScaled(newt)
    scaled_final = getScaled(final)
    # scaled_ghost = getScaled(ghost)

    # mean_excluding_zeros = np.mean(ghost_b[ghost_b != 0])

    # # Clamp the maximum values to the mean value excluding zeros
    # clamped_array = np.clip(ghost_b, a_min=0, a_max=mean_excluding_zeros)

    # n = 0
    # if n > 0:
    #     # Find the indices of the n largest values
    #     largest_indices = np.argpartition(ghost_b.flatten(), -n)[-n:]

    #     # Convert the flattened indices to 2D indices
    #     row_indices, col_indices = np.unravel_index(largest_indices, ghost_b.shape)

    #     # Set the values at the largest indices to 0
    #     ghost_b[row_indices, col_indices] = mean_excluding_zeros

    scaled_ghost_b = getScaled(ghost_b)
    
    scaled_newt_FS = getScaled(newt)
    
    # cv2.namedWindow("fs", cv2.WINDOW_NORMAL)
    # cv2.imshow("fs", scaled_data) 

    # cv2.namedWindow("newt", cv2.WINDOW_NORMAL)
    # cv2.imshow("newt", newt.astype("uint8")) 

    # cv2.namedWindow(str(theta_deg)+"ghost_b", cv2.WINDOW_NORMAL)
    # cv2.imshow(str(theta_deg)+"ghost_b", ghost_b)

    # cv2.namedWindow(str(theta_deg)+"scaled_ghost_b", cv2.WINDOW_NORMAL)
    # cv2.imshow(str(theta_deg)+"scaled_ghost_b", scaled_ghost_b)

    # cv2.namedWindow(str(theta_deg)+"ghost_0", cv2.WINDOW_NORMAL)
    # cv2.imshow(str(theta_deg)+"ghost_0", scaled_ghost) 

    # cv2.namedWindow("both", cv2.WINDOW_NORMAL)
    # cv2.imshow("both", ((scaled_ghost + scaled_ghost_b))) 

    # cv2.namedWindow(str(theta_deg)+"boty", cv2.WINDOW_NORMAL)
    # cv2.imshow(str(theta_deg)+"boty", np.maximum(scaled_final, scaled_ghost_b))

    cv2.namedWindow(str(theta_deg)+"boscaled_finalty", cv2.WINDOW_NORMAL)
    cv2.imshow(str(theta_deg)+"boscaled_finalty", scaled_final)
    cv2.namedWindow("scaled_image", cv2.WINDOW_NORMAL)
    cv2.imshow("scaled_image", (image * 255).astype("uint8"))
    cv2.namedWindow("newt", cv2.WINDOW_NORMAL)
    cv2.imshow("newt", scaled_newt_FS)  
    


def getScaled(data):
    max_value = np.max(data)
    min_value = np.min(data)  
    data_range = max_value - min_value
    if data_range == 0:
        return data
    scaled_data = (data - min_value) / data_range 
    return scaled_data

if __name__ == "__main__":

    M = 200
    w = 500
    h = 500

    bhs = BlackHoleSolver(M, h, w) 
    bhs.generate_mapping()   
    # main(bhs, 25) 
    # main(bhs, 35) 
    # main(bhs, 45)
    main(bhs, 55) 
    # main(bhs, 65) 
    # main(bhs, 75)
    # main(bhs, 85)
    # main(bhs, 89)


    cv2.waitKey(0)
    cv2.destroyAllWindows()