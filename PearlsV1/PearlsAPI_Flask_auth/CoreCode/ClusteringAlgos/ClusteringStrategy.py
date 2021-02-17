import sys

from .KMeans import KMeansClustering
from .KrNN import KrNNClustering

class ClusteringStrategy:
    """The strategy-pattern class that helps in setting the clustering algorithm
       for either the clustering or pearling process.
    """
    @staticmethod
    def set_clustering_algorithm(algorithm):
        """The function that returns a function based on the algorithm that the
           user demands.
           
           Method parameters:
           * algorithm : A string key that refers to a certain clustering algorithm
             (context variable in the strategy pattern)
           
           Output:
           The function that the user has requested for via the algorithm variable
        """

        # The dictionary of clusters
        algorithm_set = {
            'KMeans': KMeansClustering.create_clusters,
            'KrNN'  : KrNNClustering.create_clusters,
        }

        return algorithm_set[algorithm]