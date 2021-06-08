import pandas as pd
import json
import os

from CoreCode.DataContainers.Dataset import Cluster
from server_utils import return_hash
from JSONconverter import DatasetToJSON


def filter_attributes(selected_attributes, columns, dtypes):
    #! Throw error if all numerical attributes are deselected
    # TODO: ERROR HANDLING HERE
    """
        Takes care of attribute filtering during the Cluster Reclustering
    """

    ALLOWED_DTYPES = ['int', 'float']
    selected_attributes = list(selected_attributes)

    for i in range(len(columns)):
        if dtypes[columns[i]] not in ALLOWED_DTYPES:
            selected_attributes[i] = False

    return list(selected_attributes)


def DataDimensioning(metadata, JSON_path, file_path):
    """
        Function to recluster a given cluster with a subset of selected pearls
    """

    # Extracting JSON file details
    is_single_cluster_file = True
    JSON_file = ""

    if "JSONfile" not in metadata.keys():
        JSON_file = metadata["filename"]
        is_single_cluster_file = False
    else:
        JSON_file = metadata["JSONfile"]
        is_single_cluster_file = True

    email = metadata["email"]

    JSON_file = os.path.join(JSON_path, return_hash(
        email), JSON_file.split('.')[0] + '.json')

    ClusterJson = {}

    with open(JSON_file, 'r') as fp:
        data = json.load(fp)
        cluster_number = metadata["cluster_no"]

        if is_single_cluster_file:
            ClusterJson = data
        else:
            ClusterJson = data["clusters"][cluster_number]

    selected_pearls = metadata["selected_pearls"]

    # Reclustering process
    pearl_list = [pearl["pearl_list"].keys() for pearl in ClusterJson["pearl_list"]
                  if pearl["pearl_number"] in selected_pearls]
    required_datapoints = [key for u in pearl_list for key in u]
    base_file = os.path.join(
        file_path, return_hash(email), metadata["filename"])

    cluster_df = pd.read_csv(base_file).iloc[required_datapoints]
    attr_filter = filter_attributes(
        metadata["filtered_attributes"], cluster_df.columns, cluster_df.dtypes)

    new_cluster = Cluster(
        ClusterJson["cluster_number"], cluster_df, attr_filter)
    new_cluster.set_metadata(metadata)

    new_cluster.create_PEARLS(metadata["filtered_attributes"])
    new_cluster_json = DatasetToJSON().cluster_to_JSON(new_cluster)

    return new_cluster_json
