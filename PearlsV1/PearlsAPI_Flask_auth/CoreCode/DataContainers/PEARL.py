import sys
import numpy as np
import pandas as pd

#! Expect import errors here while testing with server
sys.path.append("..")
from .utils import find_centroid
from .ShapeIdentifier.PearlShapeIdentifier import PearlShapeIdentifier

class PEARL:
    """Class whose objects represent a single pearl under a cluster in the
       PEARLS algorithm

    The cluster is a container for all the pearls belonging to itself, and is
    responsible for identifying the coordinates of the pearl in 3D-space and
    triggering the shape identification algorithm for all pearls under it.
    """

    def __init__(self, cluster_number, pearl_number, pearl_data, column_filter):
        self.cluster_ID = cluster_number
        self.pearl_ID = pearl_number
        self.data = pearl_data

        # Finding the centroid and shape of the pearl
        # self.column_filter = [self.data.columns[i] for i in range(len(self.data.columns)) if not column_filter[i]]
        self.centroid = find_centroid(self.data.drop(column_filter, axis=1))

        self.P, self.radius = PearlShapeIdentifier.calculate_shape(
                                self.get_data().drop(column_filter, axis=1), self.get_centroid())
        self.centroid_3D_coords = (-np.inf, -np.inf, -np.inf)

    def set_pearl_ID(self, pearlID):
        """Setter for pearl ID"""
        self.pearl_ID = pearlID

    def get_centroid(self):
        """Getter for for pearl ID"""
        return self.centroid
    
    def get_P(self):
        """Getter for for pearl shape factor"""
        if self.P == np.inf:
            return "Infinity"

        return self.P
        
    def get_radius(self):
        """Getter for for pearl radius"""
        return self.radius
        
    def get_data(self):
        """Getter for for pearl data"""
        return self.data.copy(deep=True)

    def set_3D_coords(self, coords):
        """Setter for for 3D projected coordinates"""
        self.centroid_3D_coords = coords

    def get_3D_coords(self):
        """Getter for for 3D projected coordinates"""
        return self.centroid_3D_coords
