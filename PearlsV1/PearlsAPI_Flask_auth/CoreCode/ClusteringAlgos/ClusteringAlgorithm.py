class ClusteringAlgoTemplate:
    @staticmethod
    def create_clusters(Data, metadata, cluster_or_pearl="Cluster"):
        """Abstract class defining the template of any clustering algorithm class
           Any clustering algorithm class must inherit from this class as the base
           class.
           
           Method parameters:
           * Data: A pandas dataframe that needs to be classified
           * metadata: Parameters required for the clustering algorithm as a dictionary
             (has to be extracted before using)
           * cluster_or_pearl: can take the value either "Cluster" or "Pearl"
             depending on what object is being formed, so that the appropriate
             parameters can be extracted from the metadata.
        """
        # Data received is a dataframe
        # The return statement should be of the form:

        # return cluster_labels, number_of_clusters
        # Where cluster_labels is a list of integer labels (starting from 0) for
        # each point (in the order of the points in the data), and the number of
        # pearls is an integer, denoting the number of clusters.

        # In case the clustering algorithm can result in labelling of points as
        # outliers, the outliers should have a label of -1.
        pass