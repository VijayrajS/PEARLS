from sklearn.cluster import KMeans
from .ClusteringAlgorithm import ClusteringAlgoTemplate
import sys
import pandas as pd

sys.path.append(".")


class KMeansClustering(ClusteringAlgoTemplate):
    """Class that contains the KMeans clustering function
    """
    @staticmethod
    def create_clusters(Data, metadata, cluster_or_pearl="Cluster"):
        """Method that returns cluster labels based on the KMeans algorithm

        Note: See the ClusteringAlgoTemplate class for explanation of parameters
        and outputs
        """
        if cluster_or_pearl == "Cluster":
            no_of_clusters = metadata['number_of_clusters']
        else:
            no_of_clusters = metadata['number_of_pearls']

        Data_scaled = Data.iloc[:, 0:-1] = Data.iloc[:, 0:-1].apply(
            lambda x: (x-x.mean()) / (x.std()+1), axis=0)

        kmeans_module = KMeans(n_clusters=no_of_clusters).fit(Data_scaled)
        return kmeans_module.labels_, no_of_clusters
