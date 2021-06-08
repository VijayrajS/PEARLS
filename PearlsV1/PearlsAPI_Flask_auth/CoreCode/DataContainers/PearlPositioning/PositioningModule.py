from ..utils import distance
import math
import numpy as np

import sys
sys.path.append('..')


class PositioningModule:
    """A class that serves as a container class for multiple static methods that
       are required in calculating the 3D-projected coordinates of a point with
       respect to a given cluster centroid.
    """

    @staticmethod
    def variance(point1, point2):
        """Calculates the "variance"/squared distance of each dimension between
           two vectors

           Method parameters:
           * point1 and point2: The two points for which the squared distance has
             to be calculated.

           Output:
           A numpy array that represents the squared distance vector between the
           two points
        """

        diff = np.array(point1) - np.array(point2)
        return np.array(np.square(diff))

    @staticmethod
    def get_cos_phi(pearl, cluster_centroid):
        """Calculates the cosine of the projection angle phi of the pearl centre

           Method parameters:
           * pearl: The pearl whose centre's 3D-projected coordinates have to be
             calculated
           * cluster_centroid: The centroid of the cluster enclosing the current
             pearl

           Output:
           The value of cos_phi of the centroid of the pearl
        """

        pearl_data = pearl.get_data()
        if pearl_data.empty:
            print('DataFrame is empty!')
        pearl_centroid = pearl.get_centroid()
        pearl_centroid = np.array(pearl_centroid)
        cluster_centroid = np.array(cluster_centroid)

        # Sum of all variances
        variance_arr = np.zeros((1, len(pearl_data.columns)))
        # if(pearl_centroid.size == 0):
        #       print(pearl_data)

        for index, row in pearl_data.iterrows():
            row_variance = PositioningModule.variance(row, pearl_centroid)
            variance_arr = variance_arr + row_variance

        # Calculating cos(phi) for the pearl's centroid
        minimum_variance_index = variance_arr.argmin()
        pearl_distance = distance(pearl_centroid, cluster_centroid)

        cos_phi = (pearl_centroid[minimum_variance_index]
                   - cluster_centroid[minimum_variance_index])

        if pearl_distance == 0:
            # To avoid division by zero error
            return 0

        cos_phi /= pearl_distance
        return cos_phi

    @staticmethod
    def project_point_in_3D(point, cluster_centroid, cos_phi, z_coord=None, p=2):
        """Calculates the 3D-projected coordinates of the point provided as input
            with respect to the cluster centroid being the origin

            Method parameters:
            * point: The point whose centre's 3D-projected coordinates have to be
              calculated
            * cluster_centroid: The centroid of the cluster enclosing the current
              point
            * cos_phi: The value of cos(phi), where phi refers to the inclination
              angle of the point (in spherical coordinates)
            * p: The "p" to calculate the (p-)distance between two points

            Output:
            A 3-tuple, representing the x,y, and z-coordinates of the point projected
            in 3D with respect to the cluster centroid
        """

        sin_phi = 1 - cos_phi ** 2
        point_distance = distance(point, cluster_centroid, p)
        
        # If the point coincides with centroid, it is at the origin
        if point_distance == 0:
            return (0, 0, 0)

        sector_number = 0

        n_dim = len(point)
        for i in range(n_dim):
            if point[i] >= cluster_centroid[i]:
                sector_number += 1 << i

        theta = (2 * math.pi * sector_number)/(2 ** n_dim)
        # Calculating the coordinates after getting theta and phi

        if z_coord == None:
            x_coord = point_distance * math.cos(theta) * sin_phi
            y_coord = point_distance * math.sin(theta) * sin_phi
            z_coord = point_distance * cos_phi

        else:
            x_coord = point_distance * math.cos(theta)
            y_coord = point_distance * math.sin(theta)

        coords = np.round((x_coord, y_coord, z_coord), 3)
        return tuple(coords)
