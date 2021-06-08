from ..utils import distance
import numpy as np
import pandas as pd

import sys
import math

sys.path.append("..")


class PearlShapeIdentifier:
    """A class that serves as a container class for multiple static methods that
       are required in calculating the shape of a particular pearl.
    """

    @staticmethod
    def find_distances_from_centroid(data, centroid, p):
        """ Find the p-distances of all points in the given data from the 
            centroid of the data.

           Method parameters:
           * data: The multidimensional data for whose data points the p-distance
             has to be calculated
           * centroid: The centroid of the data
           * p: The value of p to calculate the norm to calculate the distance
             between a data point and the centroid

           Output:
           A list containing the distances of each point from the centroid
        """

        point_distances = []
        for index, row in data.iterrows():
            distance_from_centroid = distance(row, centroid, p)
            point_distances.append(distance_from_centroid)

        return point_distances

    @staticmethod
    def remove_10_percent_points(data, centroid):
        """Removes the farthest 10% of points from the data to avoid outliers
           during shape calculation

           Method parameters:
           * data: The data from which the points must be removed
           * centroid: centroid of the data being considered

           Output:
           90% of the points chosen in such a way that they are closer than the
           remaining 10% points that are being removed
        """

        point_distances = PearlShapeIdentifier.find_distances_from_centroid(
            data, centroid, 2)

        # Adding a field for distance from centroid, for easy sorting
        data['centroid_dist'] = point_distances
        data.sort_values(by=['centroid_dist'], inplace=True)

        n_rows = len(data.index)

        # Picking only 90% of the points to return back
        top_90_percent = int(np.ceil(0.9 * n_rows))
        data.drop(['centroid_dist'], axis=1, inplace=True)
        return data.iloc[:top_90_percent]

    @staticmethod
    def find_farthest_distance(data, centroid, p):
        """Find the farthest distance of all points in the data to calculate the
           radius of the pearl

           Method parameters:
           * data: The data in consideration
           * centroid: centroid of the data being considered
           * p: The value of p to calculate the norm to calculate the distance
             between a data point and the centroid

           Output:
           The maximum of distances of all points in the data
        """

        point_distances = PearlShapeIdentifier.find_distances_from_centroid(
            data, centroid, p)

        return np.max(point_distances)

    @staticmethod
    def calculate_volume_constant(p, d):
        """Calculates the volume constant (according to the algorithm in
           the pearls thesis) given the value of p and number of dimensions

           Method parameters:
           * p : The P (from the P_list of calculate_shape)
           * d : Number of dimensions of the data being considered

           Output:
           The Volume constant Vc
        """

        Vc = (2**d) * (math.gamma(1+1/p)**d / math.gamma(1.0 + d/p))
        return Vc

    @staticmethod
    def calculate_volume(point_tuple, n_dim):
        """Calculating the volume of the pearl (according to the algorithm in
           the pearls thesis) given the point 

           Method parameters:
           * point_tuple: Consists of (farthest_distance, P), where farthest_distance
             is the the maximum of distances of all points in the data, and P is
             the P (from the P_list of calculate_shape)
           * n_dim : Number of dimensions of the data being considered

           Output:
           Volume of the pearl
        """

        radius = point_tuple[1]
        Volume_const = PearlShapeIdentifier.calculate_volume_constant(
            point_tuple[0], n_dim)
        volume = Volume_const * (radius ** n_dim)
        return volume

    @staticmethod
    def calculate_shape(pearl_data, pearl_centroid):
        """Function to calculate the shape and radius of a pearl

           Method parameters:
           * pearl_data: The data of the pearl being considered
           * pearl_centroid: The centroid of the pearl being considered

           Output:
           A best_P (whose value determines the shape of the pearl), and the
           best-fit radius of the pearl
        """

        P_list = [np.inf, 2, 1, 0.5, 0.25]

        # Dropping primary key and removing outliers for shape calculation
        # pearl_data.drop(pearl_data.columns[0], axis=1, inplace=True)
        filtered_data = PearlShapeIdentifier.remove_10_percent_points(
            pearl_data, pearl_centroid)

        n_dim = len(pearl_data.columns)

        farthest_distance_list = []

        # Data_scaled = filtered_data.iloc[:, 0:-1] = filtered_data.iloc[:, 0:-1].apply(
        #     lambda x: (x-x.min()) / (x.max()-x.min()), axis=0)

        # Finding the point that gives the farthest distance for each value
        # of P in the P_list
        for p in P_list:
            farthest_distance = PearlShapeIdentifier.find_farthest_distance(
                filtered_data, pearl_centroid, p)
            p_distance_tuple = (p, farthest_distance)
            farthest_distance_list.append(p_distance_tuple)

        minimum_volume = np.inf
        representative_point = None

        # Finding the best representative point according to the pearl shape
        # algorithm in the thesis
        for point_tuple in farthest_distance_list:
            new_volume = PearlShapeIdentifier.calculate_volume(
                point_tuple, n_dim)
            if new_volume < minimum_volume:
                minimum_volume = new_volume
                representative_point = point_tuple

        best_P, best_radius = representative_point
        return best_P, best_radius
