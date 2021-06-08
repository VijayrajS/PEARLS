from .PearlPositioning.PositioningModule import PositioningModule
from ..ClusteringAlgos.ClusteringStrategy import ClusteringStrategy
from .utils import find_centroid
import sys
import numpy as np
import pandas as pd

from copy import deepcopy
from .PEARL import PEARL

sys.path.append("..")


class Cluster:
    """Class whose objects represent a single cluster in the PEARLS algorithm

    The cluster is a container for all the pearls belonging to itself, and is
    responsible for identifying the coordinates of the pearl in 3D-space and
    triggering the shape identification algorithm for all pearls under it.
    """

    def __init__(self, cluster_number, cluster_data, column_filter):
        self.cluster_ID = cluster_number
        self.data = cluster_data
        self.column_filter = [self.data.columns[i] for i in range(
            len(self.data.columns)) if not column_filter[i]]

        self.cluster_centroid = find_centroid(
            self.data.drop(self.column_filter, axis=1))
        self.pearls = []

        self.pearling_metadata_keys = [
            'pearl_clustering_algo',
            'number_of_pearls',
            'KrNN_k_for_pearling',
            'binning_dimension',
            'binning_criterion',
            'bins_per_cluster',
        ]

    def set_metadata(self, metadata):
        """Sets metadata from the input received from the enclosing
           Dataset object

           Method parameters:
           metadata: The metadata required for the pearling process, in JSON
                     form, to be extracted into python dictionaries
        """

        self.pearling_metadata = {}
        for key in self.pearling_metadata_keys:
            value = metadata.get(key)
            if value is not None:
                self.pearling_metadata[key] = value

        # Default value for number of pearls is set to 0
        try:
            self.number_of_pearls = metadata['number_of_pearls']
        except KeyError:
            self.number_of_pearls = 0

        # Default value for number of bins per cluster is set to 1
        try:
            self.bins_per_cluster = metadata['bins_per_cluster']
        except KeyError:
            self.bins_per_cluster = 1

    def create_PEARLS(self, attr_filter):
        """Function to trigger the formation of pearls of the concerned cluster.

        This function calls appropriate functions to set the pearling 
        algorithm, create bin labels (to divide the data into bins), create
        the pearls, and calculate their 3D projected coordinates. After the 
        pearls are created, it erases the cluster data points (since they are
        stored in the pearls already)
        """

        self.pearls = []
        self.set_clustering_algorithm()
        self.create_bin_labels()
        self.add_PEARLS_to_list(attr_filter)
        self.set_PEARL_coordinates()
        # Clearing data of the cluster in order to save space in main memory
        self.clear_data()

    def clear_data(self):
        """Erasing the data of the cluster from memory after the clustering
        process is done.
        """

        self.data = None

    def add_PEARLS_to_list(self, attr_filter):
        """Function that triggers the actual pearl formation.
           Results in pearls added to the pearl list.
        """

        pearl_index = 0
        if not self.bins_per_cluster:
            self.bins_per_cluster = 1

        for bin_index in range(self.bins_per_cluster):
            # Extracting data belonging to a particular bin
            bin_data = self.data[self.data['bin_number']
                                 == bin_index].copy(deep=True)

            # Dropping bin_number and primary key attributes to send data
            # for pearling
            bin_data.drop(['bin_number'], axis=1, inplace=True)

            pearl_clustering_input = self.drop_attributes(
                bin_data, attr_filter)
            clustering_labels, n_pearls = self.return_PEARLS(
                pearl_clustering_input, self.pearling_metadata, "Pearl")

            # Setting number of pearls in the case of algorithms where the
            # number of pearls are known only after clustering
            if not self.number_of_pearls:
                self.number_of_pearls = n_pearls

            bin_data['temp_label'] = clustering_labels

            # For each bin, the clustering algorithm returns labels from 0 to
            # [number of pearls]. This loop gives each pearl its absolute index
            # and appends it to the pearl list.
            for temp_pearl_number in range(self.number_of_pearls):
                pearl_data = bin_data[bin_data['temp_label']
                                      == temp_pearl_number].copy(deep=True)
                pearl_data.drop('temp_label', axis=1, inplace=True)
                new_pearl = PEARL(cluster_number=self.cluster_ID,
                                  pearl_number=pearl_index,
                                  pearl_data=pearl_data,
                                  column_filter=self.column_filter)

                self.pearls.append(new_pearl)
                pearl_index += 1

    def set_clustering_algorithm(self):
        """Sets the desired pearl clustering algorithm from the clustering strategy"""

        self.return_PEARLS = ClusteringStrategy.set_clustering_algorithm(
            self.pearling_metadata['pearl_clustering_algo'])

    def create_bin_labels(self):
        """Create bin labels to divide data into multiple bins. Keeps data in
           one single bin if binning criterion is set to "None".
        """

        bin_labels = []
        if 'binning_criterion' not in self.pearling_metadata.keys():
            binning_criterion = 'None'
        else:
            binning_criterion = self.pearling_metadata['binning_criterion']

        if binning_criterion == 'binsize':
            # Split data into approximately equal bin sizes

            # Creates a list of the form
            # [[0,1,2...k-1], [k, k+2, ..., 2*k-1]...]
            bins = np.array_split(
                range(len(self.data.index)), self.bins_per_cluster)

            # Creates the bin labels as
            # [0,0,0...(k times), 1,1, (k times),...]
            for index, list_ in enumerate(bins):
                bin_labels.extend([index]*len(list_))

        elif binning_criterion == 'range':
            # Splitting by range of a particular data dimension
            upper_bound_of_bins = self.get_upper_bounds_of_bins()

            binning_dimension = self.pearling_metadata['binning_dimension']

            for value in self.data[binning_dimension]:
                assigned_bin = 0
                # Loop to decide bin number of current data element
                for bin_bound in upper_bound_of_bins:
                    if value < bin_bound:
                        break
                    assigned_bin += 1

                bin_labels.append(assigned_bin)

        else:
            # No binning criterion given, so all data is in one bin (with label 0)
            bin_labels = np.array([0]*len(self.data.index))

        # Appending bin labels as a column to the dataframe
        self.data['bin_number'] = bin_labels

    def dataframe_from_list(self, bin_list):
        """convert a list of pandas series to a dataframe

        Method parameters:
            bin_list : A list of pandas series to be concatenated to a dataframe
        """
        return pd.concat(bin_list, axis=1).transpose()

    def get_upper_bounds_of_bins(self):
        """In the case of binning by range of a particular binning dimension,
           the function divides the entire range of the dimension into the
           number of bins required. 

        Output: A list with the upper bound of bins (A data element whose
                attribute value < upper_bound_of_bin[i] belongs to bin number `i`)
        """

        binning_dimension = self.pearling_metadata['binning_dimension']
        maximum_bound = self.data[binning_dimension].max()
        minimum_bound = self.data[binning_dimension].min()

        range_per_bin = (maximum_bound - minimum_bound) / self.bins_per_cluster

        upper_bound_of_bin = []

        for i in range(1, self.bins_per_cluster + 1):
            upper_bound_of_bin.append(minimum_bound + i * range_per_bin)

        return upper_bound_of_bin

    def set_PEARL_coordinates(self):
        """Function that sets the 3D-projected coordinates of each pearl in the
           pearl list with respect to the cluster centroid.
        """

        for i in range(len(self.pearls)):
            bin_d = self.pearling_metadata['binning_dimension']

            filtered_pearls = deepcopy(self.pearls[i])

            # filtered_pearls.data.drop(self.column_filter, axis=1, inplace=True)
            filtered_data = deepcopy(filtered_pearls)
            filtered_data.data.drop(self.column_filter, axis=1, inplace=True)

            pearl_centroid = find_centroid(filtered_data.data)

            cos_phi_of_pearl = PositioningModule.get_cos_phi(
                filtered_data, self.cluster_centroid)

            if bin_d != 'None':
                z_coord = filtered_pearls.data[bin_d].mean()
                pearl_centroid_coords = PositioningModule.project_point_in_3D(
                    pearl_centroid, self.cluster_centroid, cos_phi_of_pearl, z_coord)

            else:
                pearl_centroid_coords = PositioningModule.project_point_in_3D(pearl_centroid,
                                                                              self.cluster_centroid, cos_phi_of_pearl)
            self.pearls[i].set_3D_coords(pearl_centroid_coords)

    def get_clusterID(self):
        """Getter for for cluster ID"""
        return self.cluster_ID

    def get_centroid(self):
        """Getter for for cluster centroid"""
        return self.cluster_centroid

    def drop_attributes(self, df, filter_):
        """Drops the attributes the user does not require from the input 
        dataframe

        Method parameters:
        df: the dataframe whose attributes need to be filtered
        filter_: a boolean array that corresponds to whether the particular attribute
        at that index must be added or not
        """

        attribute_list = df.columns
        attributes_to_drop = []

        for index, attribute in enumerate(attribute_list):
            if not filter_[index]:
                attributes_to_drop.append(attribute)

        return df.drop(attributes_to_drop, axis=1)
