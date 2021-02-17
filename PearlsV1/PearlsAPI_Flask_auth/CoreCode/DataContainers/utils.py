"""General utility functions used by multiple modules across the backend"""
import numpy as np
from numpy import linalg as LA

def LP_norm(point, p):
    """Calculate the lp-norm of a given vector

    Input:
    * point: The N-D vector whose norm needs to be calculated
    * p    : The p of the LP norm

    Output: LP norm of point and given p
    """
    return LA.norm(point, p)

def distance(point0, point1, p=2):
    """Calculates the P-distance between two points, by default, P = 2

    Input:
    * point0: The first point
    * point1: The second point
    * p     : The p of the LP norm (2 by default)

    Output: P-distance between the two points, returns -1, if point0 and point1's
    dimensions don't match
    """
    if len(point0) == len(point1):
        point0 = np.array(point0)
        point1 = np.array(point1)
        dist = LP_norm(point0 - point1, p)
        return dist

    return -1

def find_centroid(dataframe):
    """Returns the mean of a dataframe that is completely numerical in nature,
       which also represents the centroid of the dataset passed as input

    Input:
    * dataframe : A pandas dataframe object, whose columns are numerical in nature

    Output: A pandas series, with each attribute's value being the mean of the
    entire dataset's values for that attribute.
    """
    return dataframe.mean()
