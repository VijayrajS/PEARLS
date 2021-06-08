import json
import numpy as np
import pandas as pd


class NpEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, np.integer):
            return int(obj)
        elif isinstance(obj, np.floating):
            return float(obj)
        elif isinstance(obj, np.ndarray):
            return obj.tolist()
        else:
            return super(NpEncoder, self).default(obj)


class DatasetToJSON:
    """
        class to convert a dataset object to a JSON object to store in file
    """

    def PEARL_to_JSON(self, PEARL_object, scale):
        """
            Function to convert pearl object to JSON
        """
        Pearl_centroid = PEARL_object.get_3D_coords()
        PEARL_data = pd.DataFrame(PEARL_object.get_data())
        pearl_JSON = {
            'pearl_number': PEARL_object.pearl_ID,
            'centroid': PEARL_object.get_centroid().to_dict(),

            'pearl_P': PEARL_object.get_P(),
            'pearl_radius': PEARL_object.get_radius(),

            'pearl_centroid_3D': Pearl_centroid,
            'pearl_list': PEARL_data.to_dict(orient="index"),
            'scaled_coords': [Pearl_centroid[i]/scale[i] for i in range(3)]
        }
        return pearl_JSON

    def cluster_to_JSON(self, cluster_object, scale=5):
        """
            Function to convert cluster object to JSON
        """
        pearl_centroids = [pearl_obj.get_3D_coords()
                           for pearl_obj in cluster_object.pearls]
        scaling_factor = [0, 0, 0]
        for centroid in pearl_centroids:
            print(scaling_factor)
            scaling_factor = [max(abs(centroid[i])/scale, scaling_factor[i])
                              for i in range(3)]

        for i in range(3):
            if scaling_factor[i] == 0:
                scaling_factor[i] = 1

        cluster_JSON = {
            'cluster_number': cluster_object.get_clusterID(),
            'centroid': cluster_object.get_centroid().to_dict(),
            'pearl_list': list(map(lambda x: self.PEARL_to_JSON(x, scaling_factor), cluster_object.pearls))
        }

        return cluster_JSON

    def convert_dataset_to_JSON(self, dataset_object):
        """
            Driver function
        """

        converted_data = {
            'clusters': []
        }

        converted_data['clusters'] = \
            list(map(lambda x: self.cluster_to_JSON(x), dataset_object.clusters))

        return json.dumps(converted_data, cls=NpEncoder)
