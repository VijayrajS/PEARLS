"""
FILE:   PEARLS_new/DataContainers/Dataset.py
AUTHOR: VIJAYRAJ SHANMUGARAJ
"""

import sys
import numpy as np
import pandas as pd

from .Cluster import Cluster

sys.path.append("..")
from ..ClusteringAlgos.ClusteringStrategy import ClusteringStrategy

from JSONconverter import DatasetToJSON

class Dataset:
    """Basic container for file fed in, stores clusters and pearls

    The Dataset class is responsible for the creation of the entire
    dataset-cluster-pearls tree-like data structure from the file that
    is being inputed. It takes care of tasks such as reclustering and
    attribute filtering as well.
    """

    def __init__(self, file_path):
        self.current_path = file_path
        self.attribute_list = []
        self.selected_attributes = []

        self.clusters = []

        self.df = None
        self.clustering_metadata = {}
        self.pearling_metadata = {}

        self.return_clusters = None

        self.number_of_clusters = 0
        
        # Keys related to the clustering algorithm
        self.clustering_metadata_keys = [
            'clustering_algo',
            'number_of_clusters',
            'KrNN_k_for_clustering',
        ]

        # Keys related to the pearl formation algorithm
        self.pearling_metadata_keys = [
            'pearl_clustering_algo',
            'number_of_pearls',
            'KrNN_k_for_pearling',
            'binning_dimension',
            'binning_criterion',
            'bins_per_cluster',
        ]

    def load_dataset(self):
        """Loads dataset, extracts attribute list, number of dimensions
           (attributes) and drops rows with missing values
        """

        self.df = pd.read_csv(self.current_path)
        self.attribute_list = list(self.df.columns)
        
        self.df.dropna(inplace=True)

    def set_metadata(self, metadata):
        """Sets metadata from the input received from the user
           
           Method parameters:
           metadata: The metadata required for the clustering process, in JSON
                     form, to be extracted into python dictionaries
        """

        self.clustering_metadata = {}
        for key in self.clustering_metadata_keys:
            value = metadata.get(key)
            if value is not None:
                self.clustering_metadata[key] = value

        self.pearling_metadata = {}
        for key in self.pearling_metadata_keys:
            value = metadata.get(key)
            if value is not None:
                self.pearling_metadata[key] = value
        
        # setting number_of_clusters to a default value of zero (this happens
        # only when clustering algorithms that determine number of clusters are involved)

        try:
            self.number_of_clusters = self.clustering_metadata['number_of_clusters']
        except KeyError:
            self.number_of_clusters = 0
        
        # Setting attribute filter
        self.filter_attributes(list(metadata['filtered_attributes']))

    def set_clustering_algorithm(self):
        """Sets the desired clustering algorithm from the clustering strategy"""

        clustering_algorithm = self.clustering_metadata['clustering_algo']
        self.return_clusters = ClusteringStrategy.set_clustering_algorithm(
                                clustering_algorithm)

    def create_clusters(self):
        """Function to trigger the cluster and pearl formation of the dataset"""

        self.clusters = []
        self.set_clustering_algorithm()

        # Dropping the attributes that are excluded for cluster calculation
        
        df_for_clustering = self.drop_attributes(self.df)
        cluster_labels, n_clusters = self.return_clusters(df_for_clustering,
                                        self.clustering_metadata)

        # Setting number of clusters in the case of algorithms where
        # the number of clusters are known only after clustering
        if not self.number_of_clusters:
            self.number_of_clusters = n_clusters

        # Classfying points based on their cluster label
        # index = -1 implies that the point was classified as an outlier
        cluster_data = [[] for _ in range(self.number_of_clusters)]
        for index, row in self.df.iterrows():
            if index != -1:
                cluster_data[cluster_labels[index]].append(row)

        # Creating new clusters and initiating pearl formation
        for cluster_index, cluster_list in enumerate(cluster_data):
            cleaned_cluster_data = pd.concat(cluster_list, axis=1).transpose()
            new_cluster = Cluster(cluster_data=cleaned_cluster_data.copy(deep=True),
                                    cluster_number=cluster_index, column_filter = self.selected_attributes)
            
            new_cluster.set_metadata(self.pearling_metadata)

            new_cluster.create_PEARLS(self.selected_attributes)
            self.clusters.append(new_cluster)

    def get_attribute_list(self):
        """Returns list of attributes of the dataset"""
        
        return list(self.df.columns)

    def filter_attributes(self, selected_attributes):
        #! Throw error if all numerical attributes are deselected
        # TODO: ERROR HANDLING HERE
        
        ALLOWED_DTYPES = ['int', 'float']
        selected_attributes = list(selected_attributes)
        columns = self.get_attribute_list()

        for i in range(len(columns)):
            if self.df.dtypes[columns[i]] not in ALLOWED_DTYPES:
                selected_attributes[i] = False

        self.selected_attributes = list(selected_attributes)

    def drop_attributes(self, df):
        """Drops the attributes the user does not require from the input 
           dataframe

           Method parameters:
           df: the dataframe whose attributes need to be filtered
        """
        attributes_to_drop = []
        
        for index, attribute in enumerate(self.attribute_list):
            if not self.selected_attributes[index]:
                attributes_to_drop.append(attribute)

        return df.drop(attributes_to_drop, axis=1)

if __name__ == '__main__':

    dataset_object = Dataset('iris.csv')

    metadata = {
        'clustering_algo':'KMeans',
        'number_of_clusters': 2,
        # 'KrNN_k_for_clustering': 1,

        'pearl_clustering_algo': 'KMeans',
        'number_of_pearls': 2,
        # 'KrNN_k_for_pearling': 4,
        # 'binning_dimension': 'Petal Length',
        'binning_criterion': 'None',
        # 'bins_per_cluster': 2,
    }
    
    import time
    t = time.time()
    dataset_object.load_dataset()
    dataset_object.set_metadata(metadata)
    
    dataset_object.create_clusters()
    final_time = time.time()-t

    json_converter = DatasetToJSON()
    print(json_converter.convert_dataset_to_JSON(dataset_object))
    # print(final_time)
