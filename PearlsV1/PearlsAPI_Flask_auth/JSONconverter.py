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
    
    def PEARL_to_JSON(self, PEARL_object):
        PEARL_data = pd.DataFrame(PEARL_object.get_data())
        pearl_JSON = {
            'pearl_number' : PEARL_object.pearl_ID,
            'centroid': PEARL_object.get_centroid().to_dict(),
            
            'pearl_P': PEARL_object.get_P(),
            'pearl_radius': PEARL_object.get_radius(),
            
            'pearl_centroid_3D': PEARL_object.get_3D_coords(),
            'pearl_list': PEARL_data.to_dict(orient="index")
        }
        return pearl_JSON
        
    def cluster_to_JSON(self, cluster_object):
        cluster_JSON = {
            'cluster_number' : cluster_object.get_clusterID(),
            'centroid': cluster_object.get_centroid().to_dict(),
            'pearl_list': list(map(lambda x: self.PEARL_to_JSON(x), cluster_object.pearls))
        }

        return cluster_JSON
        
    def convert_dataset_to_JSON(self, dataset_object):
        converted_data = {
            'clusters':[]
            }
        
        converted_data['clusters'] = \
                    list(map(lambda x: self.cluster_to_JSON(x), dataset_object.clusters))

        return json.dumps(converted_data, cls=NpEncoder)
